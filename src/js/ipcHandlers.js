const path = require("path");
const fs = require("fs");
const {app, ipcMain, BrowserWindow} = require("electron");
const {exec, spawn} = require("child_process");
const AdmZip = require("adm-zip");
const { autoUpdater } = require("electron-updater");

const {downloadGame} = require("./downloadManager");
const {
    getInstalledGames,
    showContextMenu,
    uninstallGame,
    getGameSize,
    startPlaytimeTracking,
    stopPlaytimeTracking,
    getGamePlaytime
} = require("./gameManager");
const {getCurrentGameVersion, getLatestGameVersion} = require("./updater");
const {loadSettings, saveSettings, diabolicalLauncherPath} = require("./settings");
const {cacheGamesLocally, readCachedGames} = require("./cacheManager");
const { getPreferredExecutable } = require("./launcherUtils");

// Track running game processes
const runningGames = new Map();

function initIPCHandlers() {
    //Game Actions
    ipcMain.on("download-game", downloadGame);
    ipcMain.handle("get-installed-games", async () => {
        return getInstalledGames();
    });
    ipcMain.handle("get-current-game-version", async (event, gameId) => {
        return getCurrentGameVersion(gameId);
    });

    ipcMain.handle("get-latest-game-version", async (event, gameId) => {
        return await getLatestGameVersion(gameId);
    });

    ipcMain.handle("get-game-size", async (event, gameId) => {
        return getGameSize(gameId);
    });

    ipcMain.handle("get-game-playtime", async (event, gameId) => {
        return getGamePlaytime(gameId);
    });

    ipcMain.on("open-game", (event, gameId) => {
        const gamePath = path.join(diabolicalLauncherPath, gameId);
        // Find the preferred .exe file in the game directory
        let executablePath = getPreferredExecutable(gamePath, gameId);
        if (!executablePath) {
            event.sender.send("game-stopped", gameId);
            throw new Error('No .exe file found in game directory');
        }

        // Start tracking playtime
        startPlaytimeTracking(gameId);

        // Use spawn instead of exec for better process control
        const gameProcess = spawn(executablePath, [], {
            cwd: gamePath,
            env: process.env,
            detached: true, // This allows the process to continue running after the launcher closes
            stdio: 'ignore' // Ignore stdio to prevent hanging
        });

        // Store the process with its PID
        runningGames.set(gameId, {
            process: gameProcess,
            pid: gameProcess.pid
        });

        // Handle process exit
        gameProcess.on('exit', (code) => {
            console.log(`Game process exited with code ${code}`);
            runningGames.delete(gameId);
            stopPlaytimeTracking(gameId);
            event.sender.send("game-stopped", gameId);
        });

        // Handle process error
        gameProcess.on('error', (err) => {
            console.error('Failed to start game process:', err);
            runningGames.delete(gameId);
            stopPlaytimeTracking(gameId);
            event.sender.send("game-stopped", gameId);
        });

        event.sender.send("game-started", gameId);
    });

    ipcMain.on("stop-game", (event, gameId) => {
        const gameInfo = runningGames.get(gameId);
        if (gameInfo) {
            let exited = false;

            // Listen for process exit (only once)
            const onExit = () => {
                exited = true;
                runningGames.delete(gameId);
                stopPlaytimeTracking(gameId);
                event.sender.send("game-stopped", gameId);
            };
            gameInfo.process.once('exit', onExit);

            try {
                gameInfo.process.kill();

                setTimeout(() => {
                    // Check if process is still running before calling taskkill
                    try {
                        process.kill(gameInfo.pid, 0); // throws if not running
                    } catch (e) {
                        // Process is already dead, do not call taskkill
                        return;
                    }
                    // If we get here, process is still running, so force kill
                    const taskkill = spawn('taskkill', ['/F', '/T', '/PID', gameInfo.pid.toString()]);
                    taskkill.on('exit', (code) => {
                        if (code === 0) {
                            console.log(`Successfully killed process ${gameInfo.pid}`);
                        } else {
                            console.log(`Process ${gameInfo.pid} was already terminated or could not be found.`);
                        }
                        runningGames.delete(gameId);
                        stopPlaytimeTracking(gameId);
                        event.sender.send("game-stopped", gameId);
                    });
                    taskkill.on('error', (err) => {
                        console.error('Error executing taskkill:', err);
                        runningGames.delete(gameId);
                        stopPlaytimeTracking(gameId);
                        event.sender.send("game-stopped", gameId);
                    });
                }, 1000);
            } catch (err) {
                console.error('Error in stop-game:', err);
                runningGames.delete(gameId);
                stopPlaytimeTracking(gameId);
                event.sender.send("game-stopped", gameId);
            }
        }
    });

    ipcMain.handle("is-game-running", (event, gameId) => {
        return runningGames.has(gameId);
    });

    ipcMain.on("open-install-location", (event, gameId) => {
        const gamePath = path.join(diabolicalLauncherPath, gameId);
        exec(`explorer "${gamePath}"`);
    });

    ipcMain.on("show-context-menu", (event, gameId, position) => {
        showContextMenu(event, gameId, position);
    });
    ipcMain.on("uninstall-game", (event, gameId) => {
        uninstallGame(gameId);
    });

    ipcMain.handle("get-cached-games", () => {
        return readCachedGames();
    });

    ipcMain.handle("cache-games-locally", (event, games) => {
        cacheGamesLocally(games);
    });

    //Launcher Actions
    ipcMain.on("close-window", () => {
        const mainWindow = require("./windowManager").getMainWindow();
        if (mainWindow) {
            mainWindow.close();
        }
    });
    ipcMain.on("reload-window", () => {
        const mainWindow = require("./windowManager").getMainWindow();
        if (mainWindow) {
            mainWindow.reload();
        }
    });
    ipcMain.on("minimize-window", () => {
        const mainWindow = require("./windowManager").getMainWindow();
        if (mainWindow) {
            mainWindow.minimize();
        }
    });
    ipcMain.handle("get-app-version", () => {
        return app.getVersion();
    });
    ipcMain.on("check-for-updates", () => {
        require("./updater").checkForUpdates();
    });
    ipcMain.on("download-update", () => {
        require("./updater").downloadUpdate();
    });
    ipcMain.handle("get-settings", () => {
        const settings = loadSettings();
        return {
            windowSize: `${settings.windowSize.width}x${settings.windowSize.height}`,
            language: settings.language || "en",
            autoUpdate: settings.autoUpdate !== false,
            notifications: settings.notifications !== false,
            minimizeToTray: settings.minimizeToTray !== false,
            launchOnStartup: settings.launchOnStartup || false,
            downloadPath: settings.downloadPath || "",
            maxConcurrentDownloads: settings.maxConcurrentDownloads || 3,
            cacheSize: settings.cacheSize || "5GB",
            customCursor: settings.customCursor || false,
        };
    });
    ipcMain.handle("update-settings", (event, newSettings) => {
        const currentSettings = loadSettings();
        const updatedSettings = {...currentSettings};

        // Handle window size separately
        if (newSettings.windowSize) {
            const [width, height] = newSettings.windowSize.split("x").map(Number);
            updatedSettings.windowSize = {width, height};
            const mainWindow = require("./windowManager").getMainWindow();
            if (mainWindow) {
                mainWindow.setContentSize(width, height);
                mainWindow.center();
            }
        }

        // Update other settings
        Object.keys(newSettings).forEach(key => {
            if (key !== 'windowSize') {
                updatedSettings[key] = newSettings[key];
            }
        });

        saveSettings(updatedSettings);

        // Handle launch on startup
        if (typeof updatedSettings.launchOnStartup !== "undefined") {
            app.setLoginItemSettings({
                openAtLogin: !!updatedSettings.launchOnStartup,
                path: process.execPath,
            });
        }

        // Handle auto update
        if (typeof updatedSettings.autoUpdate !== "undefined") {
            if (updatedSettings.autoUpdate) {
                autoUpdater.checkForUpdates();
            }
        }

        // Send settings update directly to renderer
        const mainWindow = require("./windowManager").getMainWindow();
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send("settings-updated", updatedSettings);
        }

        return updatedSettings;
    });
    ipcMain.handle("get-window-size", () => {
        const mainWindow = require("./windowManager").getMainWindow();
        if (mainWindow) {
            const {width, height} = mainWindow.getContentBounds();
            return {
                width: Math.round(width / 10) * 10, height: Math.round(height / 10) * 10,
            };
        }
        return {width: 1280, height: 720};
    });
    ipcMain.on("set-window-size-and-center", (event, width, height) => {
        const mainWindow = require("./windowManager").getMainWindow();
        if (mainWindow) {
            allowResize = true;
            mainWindow.setContentSize(Math.round(width / 10) * 10, Math.round(height / 10) * 10);
            mainWindow.center();
            const settings = loadSettings();
            settings.windowSize = {
                width: Math.round(width / 10) * 10, height: Math.round(height / 10) * 10,
            };
            saveSettings(settings);
            allowResize = false;
        } else {
            console.log("Main window is not accessible.");
        }
    });
    ipcMain.on("show-notification", (event, data) => {
        const mainWindow = BrowserWindow.getFocusedWindow() || require("./windowManager").getMainWindow();

        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send("show-notification", data);
        } else {
            console.log("No main window found to send notification");
        }
    });

    // Add settings-updated event handler
    ipcMain.on("settings-updated", (event, settings) => {
        const mainWindow = require("./windowManager").getMainWindow();
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send("settings-updated", settings);
        }
    });

    //Github API
    ipcMain.handle("fetch-github-workflows", async (event, repoFullName, accessToken) => {
        try {
            const response = await fetch(`https://api.github.com/repos/${repoFullName}/actions/runs`, {
                headers: {Authorization: `Bearer ${accessToken}`}
            });
            const data = await response.json();
            return data.workflow_runs || [];
        } catch (error) {
            console.error("❌ Error fetching workflows:", error);
            return [];
        }
    });
    ipcMain.handle("fetch-github-logs", async (event, repoFullName, runId, accessToken) => {
        try {
            const response = await fetch(`https://api.github.com/repos/${repoFullName}/actions/runs/${runId}/logs`, {
                headers: {Authorization: `Bearer ${accessToken}`}
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch logs: ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            const zip = new AdmZip(Buffer.from(buffer));

            let extractedLogs = "";
            zip.getEntries().forEach((entry) => {
                if (!entry.isDirectory && entry.entryName.endsWith(".txt")) {
                    extractedLogs += `\n--- ${entry.entryName} ---\n${zip.readAsText(entry)}`;
                }
            });

            return extractedLogs || "No logs found in archive.";
        } catch (error) {
            console.error("❌ Error extracting logs:", error);
            return "Failed to retrieve logs.";
        }
    });
}

module.exports = {
    initIPCHandlers,
};
