const {autoUpdater} = require("electron-updater");
const os = require("os");
const fs = require("fs");
const path = require("path");
const {getLatestGameVersion} = require("./versionChecker");
const {getInstalledGames} = require("./gameManager");
const {showMessage} = require("./windowManager");

let mainWindow = null;

const versionDirectory = path.join(os.homedir(), "AppData", "Local", "Diabolical Launcher");

//Launcher auto update logic
function initUpdater() {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on("update-available", (info) => {
        showMessage(`Launcher update available. Download Started...`);
        showCustomNotification(mainWindow, "Launcher Update", "Download started.", "launcher");
        autoUpdater.downloadUpdate();
    });

    autoUpdater.on("update-not-available", (info) => {
        showMessage(`Diabolical Launcher`);
    });

    autoUpdater.on("update-downloaded", (info) => {
        showMessage(`Launcher update downloaded. Restarting...`);
        autoUpdater.quitAndInstall();
    });

    autoUpdater.on("error", (info) => {
        showMessage(`Launcher update error: ${info}`);
    });
}
function checkForUpdates() {
    autoUpdater.checkForUpdates();
}

//Show the toaster so the user can download the update for the game
function showCustomNotification(mainWindow, title, body, gameId) {
    console.log(`Sending notification: ${title}, ${body}, GameID: ${gameId}`);
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('show-notification', {title, body, gameId});
    } else {
        console.log('mainWindow or webContents is not available.');
    }
}

//Checks the games current and most recent version to determine if there are updates
async function checkGameUpdates(gameId, currentVersion) {
    try {
        const {latestVersion} = await getLatestGameVersion(gameId);

        if (latestVersion && latestVersion !== currentVersion) {
            console.log(`New game update available for ${gameId}: Version ${latestVersion}`);

            showCustomNotification(mainWindow, `Update for ${gameId}`, `v${latestVersion}`, gameId);
        } else {
            console.log(`${gameId} is up-to-date. Current version: ${currentVersion}`);
        }
    } catch (error) {
        console.error(`Error checking game updates for ${gameId}:`, error);
    }
}

//Current version of the installed game
function getCurrentGameVersion(gameId) {
    const versionFile = path.join(versionDirectory, `${gameId}-version.json`);
    try {
        const versionData = fs.readFileSync(versionFile);
        const parsedData = JSON.parse(versionData);
        return parsedData.version;
    } catch (error) {
        console.error(`Failed to read version file for ${gameId}:`, error);
        return null;
    }
}

//Check for updates every minute
function periodicallyCheckGameVersions(gameIds, interval = 60000) {
    gameIds.forEach((gameId) => {
        const currentVersion = getCurrentGameVersion(gameId);
        if (currentVersion) {
            checkGameUpdates(gameId, currentVersion);
        }
    });

    setInterval(() => {
        gameIds.forEach((gameId) => {
            const currentVersion = getCurrentGameVersion(gameId);
            if (currentVersion) {
                checkGameUpdates(gameId, currentVersion);
            }
        });
    }, interval);
}
function startPeriodicChecks(window, interval = 60000) {
    mainWindow = window;

    const gameIds = getInstalledGames();

    if (!gameIds || gameIds.length === 0) {
        console.log("No installed games found for update checks.");
        return;
    }

    periodicallyCheckGameVersions(gameIds, interval);
}

module.exports = {
    initUpdater, startPeriodicChecks, checkForUpdates, getLatestGameVersion, getCurrentGameVersion
};
