const path = require("path");
const fs = require("fs");
const {app, ipcMain, BrowserWindow} = require("electron");
const {exec} = require("child_process");
const {
    loadSettings, saveSettings, diabolicalLauncherPath,
} = require("./settings");
const AdmZip = require("adm-zip"); // 📌 Install this with: npm install adm-zip

const {downloadGame} = require("./downloadManager");
const {getInstalledGames, showContextMenu, uninstallGame} = require("./gameManager");

function initIPCHandlers() {
    ipcMain.on("show-context-menu", (event, gameId, position) => {
        showContextMenu(event, gameId, position);
    });

    ipcMain.on("uninstall-game", (event, gameId) => {
        uninstallGame(gameId);
    });

    ipcMain.handle("get-settings", () => {
        return loadSettings();
    });

    ipcMain.handle("update-settings", (event, newSettings) => {
        const settings = {...loadSettings(), ...newSettings};
        saveSettings(settings);
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

    // Use the GitHub Installation Access Token stored in cookies
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

    ipcMain.on("check-for-updates", () => {
        require("./updater").checkForUpdates();
    });

    ipcMain.handle("load-games", async () => {
        try {
            return await require("./database").fetchGames();
        } catch (error) {
            console.error("Failed to fetch games:", error);
            return [];
        }
    });

    ipcMain.handle("load-html", async (event, filePath) => {
        const fullPath = path.join(app.getAppPath(), filePath);
        return fs.promises
            .readFile(fullPath, "utf8")
            .catch((error) => console.error(error));
    });

    ipcMain.on("download-game", downloadGame);

    ipcMain.on("open-game", (event, gameId) => {
        const gamePath = path.join(diabolicalLauncherPath, gameId);
        const executablePath = path.join(gamePath, "StandaloneWindows64.exe");

        if (!fs.existsSync(executablePath)) {
            console.error(`Executable not found at path: ${executablePath}`);
            event.sender.send("game-launch-error", `Executable not found at path: ${executablePath}`);
            return;
        }

        console.log(`Launching game from path: ${executablePath}`);

        exec(`"${executablePath}"`, {cwd: gamePath, env: process.env}, (error, stdout, stderr) => {
            if (error) {
                console.error(`Failed to open game: ${error.message}`);
                console.error(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                event.sender.send("game-launch-error", `Failed to open game: ${error.message}`);
            } else {
                console.log("Game launched successfully");
            }
        });
    });

    ipcMain.handle("get-installed-games", async () => {
        return getInstalledGames();
    });

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

    ipcMain.on("show-notification", (event, data) => {
        const mainWindow = BrowserWindow.getFocusedWindow() || require("./windowManager").getMainWindow();

        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send("show-notification", data);
        } else {
            console.log("No main window found to send notification");
        }
    });

}

module.exports = {
    initIPCHandlers,
};
