const { autoUpdater } = require("electron-updater");
const { showMessage } = require("./windowManager");

async function getLatestGameVersion(gameId) {
  const fetch = (await import('node-fetch')).default;
  const apiUrl = 'https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/';

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data = await response.json();

    const versions = data.objects
      .map(obj => obj.name)
      .filter(name => name.startsWith(`${gameId}/Versions/Build-StandaloneWindows64-`))
      .map(name => {
        const versionMatch = name.match(/Build-StandaloneWindows64-(\d+\.\d+\.\d+)\.zip$/);
        return versionMatch ? versionMatch[1] : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

    const latestVersion = versions[0];
    const latestVersionUrl = `https://frks8kdvmjog.objectstorage.eu-frankfurt-1.oci.customer-oci.com/p/suRf4hOSm9II9YuoH_LuoZYletMaP59e2cIR1UXo84Pa6Hi26oo5VlWAT_XDt5R5/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/${gameId}/Versions/Build-StandaloneWindows64-${latestVersion}.zip`;

    return { latestVersion, latestVersionUrl };
  } catch (error) {
    console.error('Failed to fetch the latest game version:', error);
    throw error;
  }
}

function initUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) => {
    showMessage(`Update available. Download Started...`);
    autoUpdater.downloadUpdate();
  });

  autoUpdater.on("update-not-available", (info) => {
    showMessage(`Launcher version:`);
  });

  autoUpdater.on("update-downloaded", (info) => {
    showMessage(`Update downloaded. Restarting...`);
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on("error", (info) => {
    showMessage(info);
  });
}

function checkForUpdates() {
  autoUpdater.checkForUpdates();
}

module.exports = {
  initUpdater,
  checkForUpdates,
  getLatestGameVersion,
};
