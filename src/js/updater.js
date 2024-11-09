const { autoUpdater } = require("electron-updater");
const { showMessage } = require("./windowManager");
const { BrowserWindow } = require("electron");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { downloadGame } = require("./downloadManager");
const { getLatestGameVersion } = require("./versionChecker"); // Correct import

let mainWindow = null; // To store the reference to the main window

const versionDirectory = path.join(
  os.homedir(),
  "AppData",
  "Local",
  "Diabolical Launcher"
);

// Function to initialize the updater with the main window instance
function initUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) => {
    showMessage(`Launcher update available. Download Started...`);
    showCustomNotification(mainWindow, "Launcher Update", "Download started.", "launcher");
    autoUpdater.downloadUpdate();
  });

  autoUpdater.on("update-not-available", (info) => {
    showMessage(`Diabolical Launcher Version:`);
  });

  autoUpdater.on("update-downloaded", (info) => {
    showMessage(`Launcher update downloaded. Restarting...`);
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on("error", (info) => {
    showMessage(`Launcher update error: ${info}`);
  });
}

// Function to send a custom notification to the renderer
function showCustomNotification(mainWindow, title, body, gameId) {
  console.log(`Sending notification: ${title}, ${body}, GameID: ${gameId}`); // Debugging
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('show-notification', { title, body, gameId });
  } else {
    console.log('mainWindow or webContents is not available.');
  }
}

// Function to check for game updates
async function checkGameUpdates(gameId, currentVersion) {
  try {
    const { latestVersion } = await getLatestGameVersion(gameId);

    if (latestVersion && latestVersion !== currentVersion) {
      console.log(`New game update available for ${gameId}: Version ${latestVersion}`);

      // Send notification to frontend
      showCustomNotification(mainWindow, `Update for ${gameId}`, `v${latestVersion}`, gameId);
    } else {
      console.log(`${gameId} is up-to-date. Current version: ${currentVersion}`);
    }
  } catch (error) {
    console.error(`Error checking game updates for ${gameId}:`, error);
  }
}

function checkForUpdates() {
  autoUpdater.checkForUpdates();
}

// Function to get the current version of the game from local storage
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

// Function to periodically check all game versions and notify if there are updates
function periodicallyCheckGameVersions(gameIds, interval = 600000) {
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

function startPeriodicChecks(window) {
  mainWindow = window;
  const gameIds = ["Forgekeepers", "GFOS1992", "DieStylish", "GP1"];
  periodicallyCheckGameVersions(gameIds);
}

module.exports = {
  initUpdater,
  checkGameUpdates,
  startPeriodicChecks,
  checkForUpdates,
  getLatestGameVersion
};
