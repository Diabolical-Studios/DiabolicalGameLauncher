const { autoUpdater } = require('electron-updater');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { getLatestGameVersion } = require('./versionChecker');
const { getInstalledGames } = require('./gameManager');
const { showMessage } = require('./windowStore');
const settingsModule = require('./settings');

let mainWindow = null;

function checkForUpdates() {
  // Remove runtime channel override - let it use the build-time channel
  autoUpdater.checkForUpdates();
  showMessage('Checking For Updates... ');
}

function downloadUpdate() {
  autoUpdater.downloadUpdate();
  showMessage('Downloading Update... ');
}

// Show the toaster so the user can download the update for the game
function showCustomNotification(targetWindow, title, body, gameId, duration = 5000) {
  console.log(`Sending notification: ${title}, ${body}, GameID: ${gameId}`);
  if (targetWindow && targetWindow.webContents) {
    targetWindow.webContents.send('show-notification', {
      title,
      body,
      gameId,
      duration,
    });
  }
}

// Checks the games current and most recent version to determine if there are updates
async function checkGameUpdates(gameId, currentVersion) {
  try {
    const result = await getLatestGameVersion(gameId);
    if (!result || !result.latestVersion) {
      console.warn(`No version info found for ${gameId}, skipping update check.`);
      return;
    }
    const { latestVersion } = result;

    if (latestVersion !== currentVersion) {
      console.log(`New game update available for ${gameId}: Version ${latestVersion}`);
      showCustomNotification(mainWindow, `Update for ${gameId}`, `v${latestVersion}`, gameId);
    } else {
      console.log(`${gameId} is up-to-date. Current version: ${currentVersion}`);
    }
  } catch (error) {
    if (
      error &&
      typeof error.message === 'string' &&
      error.message.includes('No version information found for game')
    ) {
      console.warn(`No version info found for ${gameId}, skipping update check.`);
    } else {
      console.error(`Error checking game updates for ${gameId}:`, error);
    }
  }
}

// Current version of the installed game
function getCurrentGameVersion(gameId) {
  let versionFile = settingsModule.versionFilePath(gameId);
  if (!fs.existsSync(versionFile)) {
    // Fallback to old location for backward compatibility
    versionFile = path.join(settingsModule.diabolicalLauncherPath, `${gameId}-version.json`);
  }
  try {
    const versionData = fs.readFileSync(versionFile);
    const parsedData = JSON.parse(versionData);
    return parsedData.version;
  } catch (error) {
    console.error(`Failed to read version file for ${gameId}:`, error);
    return null;
  }
}

// Check for updates every minute
function periodicallyCheckGameVersions(gameIds, interval = 60000) {
  gameIds.forEach(gameId => {
    const currentVersion = getCurrentGameVersion(gameId);
    if (currentVersion) {
      checkGameUpdates(gameId, currentVersion);
    }
  });

  setInterval(() => {
    gameIds.forEach(gameId => {
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
    console.log('No installed games found for update checks.');
    return;
  }

  periodicallyCheckGameVersions(gameIds, interval);
}

// Launcher auto update logic
function initUpdater() {
  const settings = settingsModule.loadSettings(); //  Load settings

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.channel = process.env.PUBLISH_CHANNEL;

  autoUpdater.on('update-available', () => {
    if (settings.autoUpdate) {
      //  Check settings before updating
      showMessage('Launcher update available. Download Started...');
      showCustomNotification(mainWindow, 'Launcher Update', 'Download started.', 'launcher');
      autoUpdater.downloadUpdate();
    } else {
      showMessage('Diabolical Launcher');
      showCustomNotification(
        mainWindow,
        'Launcher Update',
        'Launcher update available but auto-update is disabled in settings.',
        'launcher'
      );
    }
  });

  autoUpdater.on('update-not-available', () => {
    showMessage('Diabolical Launcher');
    showCustomNotification(mainWindow, 'Launcher Update', 'No updates available.');
  });

  autoUpdater.on('update-downloaded', () => {
    showMessage('Launcher update downloaded. Restarting...');
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('error', info => {
    // Suppress the error if it's about missing beta.yml or latest.yml
    if (
      info &&
      info.message &&
      (info.message.includes('Cannot find beta.yml') ||
        info.message.includes('Cannot find latest.yml'))
    ) {
      // Do not show this error to the user
      showMessage('Diabolical Launcher');
      showCustomNotification(mainWindow, 'Launcher Update', 'No updates available.');
      return;
    }
    showMessage(`Launcher update error: ${info}`);
  });
}

module.exports = {
  initUpdater,
  startPeriodicChecks,
  checkForUpdates,
  getLatestGameVersion,
  getCurrentGameVersion,
  downloadUpdate,
};
