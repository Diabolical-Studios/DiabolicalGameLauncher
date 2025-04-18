const path = require("path");
const fs = require("fs");
const {app, ipcMain, BrowserWindow} = require("electron");
const {exec} = require("child_process");
const AdmZip = require("adm-zip");

const {downloadGame} = require("./downloadManager");
const {getInstalledGames, showContextMenu, uninstallGame} = require("./gameManager");
const {getCurrentGameVersion, getLatestGameVersion} = require("./updater");
const {loadSettings, saveSettings, diabolicalLauncherPath} = require("./settings");
const {cacheGamesLocally, readCachedGames} = require("./cacheManager");

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

    ipcMain.on("open-game", (event, gameId) => {
        const gamePath = path.join(diabolicalLauncherPath, gameId);
        const executablePath = path.join(gamePath, "StandaloneWindows64.exe");
        exec(`start "" "${executablePath}"`);
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
    ipcMain.handle("get-app-version", () => {
        return app.getVersion();
    });
    ipcMain.on("check-for-updates", () => {
        require("./updater").checkForUpdates();
    });
    ipcMain.handle("get-settings", () => {
        const settings = loadSettings();
        return {
            windowSize: `${settings.windowSize.width}x${settings.windowSize.height}`,
            theme: settings.theme || "dark",
            language: settings.language || "en",
            autoUpdate: settings.autoUpdate !== false,
            notifications: settings.notifications !== false,
            minimizeToTray: settings.minimizeToTray !== false,
            launchOnStartup: settings.launchOnStartup || false,
            downloadPath: settings.downloadPath || "",
            maxConcurrentDownloads: settings.maxConcurrentDownloads || 3,
            cacheSize: settings.cacheSize || "5GB"
        };
    });
    ipcMain.handle("update-settings", (event, newSettings) => {
        const currentSettings = loadSettings();
        const updatedSettings = { ...currentSettings };

        // Handle window size separately
        if (newSettings.windowSize) {
            const [width, height] = newSettings.windowSize.split("x").map(Number);
            updatedSettings.windowSize = { width, height };
            const mainWindow = require("./windowManager").getMainWindow();
            if (mainWindow) {
                mainWindow.setContentSize(width, height);
                mainWindow.center();
            }
        }

        // Handle theme change
        if (newSettings.theme && newSettings.theme !== currentSettings.theme) {
            updatedSettings.theme = newSettings.theme;
            // Notify the renderer process about theme change
            const mainWindow = require("./windowManager").getMainWindow();
            if (mainWindow) {
                mainWindow.webContents.send("theme-changed", newSettings.theme);
            }
        }

        // Update other settings
        Object.keys(newSettings).forEach(key => {
            if (key !== "windowSize" && key !== "theme") {
                updatedSettings[key] = newSettings[key];
            }
        });

        saveSettings(updatedSettings);
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
