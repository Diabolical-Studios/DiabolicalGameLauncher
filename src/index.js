const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { download } = require("electron-dl");
const extract = require("extract-zip");
const { fetchGames } = require("./js/database");
const oracledb = require("oracledb");
const { exec } = require("child_process");
const axios = require("axios");

let mainWindow;
let allowResize = false;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

const diabolicalLauncherPath = path.join(
  os.homedir(),
  "AppData",
  "Local",
  "Diabolical Launcher"
);
const versionFilePath = (gameId) =>
  path.join(diabolicalLauncherPath, `${gameId}-version.json`);
const settingsFilePath = path.join(diabolicalLauncherPath, "settings.json");

// Default settings
const defaultSettings = {
  windowSize: { width: 1280, height: 720 },
  theme: "dark",
  language: "en",
};

function loadSettings() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const data = fs.readFileSync(settingsFilePath);
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading settings:", error);
  }
  return defaultSettings;
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

const createWindow = () => {
  const settings = loadSettings();

  mainWindow = new BrowserWindow({
    width: settings.windowSize.width,
    height: settings.windowSize.height,
    frame: false,
    icon: "path/to/your/icon.ico",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    resizable: true,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.center();

  mainWindow.on("will-resize", (e) => {
    if (!allowResize) {
      e.preventDefault();
    }
  });

  mainWindow.webContents.on("did-finish-load", async () => {
    autoUpdater.checkForUpdates();
    pingDatabase("https://diabolical.studio");
    showMessage(`Checking for updates...`);

    const installedGames = getInstalledGames();
    for (const gameId of installedGames) {
      await checkForGameUpdates(gameId);
    }
  });

  setInterval(() => {
    pingDatabase("https://diabolical.studio");
  }, 60000);

  mainWindow.on("close", () => {
    const [width, height] = mainWindow.getSize();
    settings.windowSize = { width, height };
    saveSettings(settings);
  });
};

ipcMain.handle("get-settings", () => {
  return loadSettings();
});

ipcMain.handle("update-settings", (event, newSettings) => {
  const settings = { ...loadSettings(), ...newSettings };
  saveSettings(settings);
});

ipcMain.handle("get-window-size", () => {
  if (mainWindow) {
    const { width, height } = mainWindow.getBounds();
    return { width, height };
  }
  return { width: 1280, height: 720 };
});

ipcMain.on("set-window-size-and-center", (event, width, height) => {
  if (mainWindow) {
    allowResize = true;
    mainWindow.setSize(width, height);
    mainWindow.center();
    const settings = loadSettings();
    settings.windowSize = { width, height };
    saveSettings(settings);
    allowResize = false;
  } else {
    console.log("Main window is not accessible.");
  }
});

function pingDatabase(url) {
  axios
    .get(url)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        console.log(`Website ${url} is up! Status Code: ${response.status}`);
        mainWindow.webContents.send("db-status", "rgb(72, 216, 24)");
      } else {
        console.log(`Website ${url} returned status code ${response.status}`);
        mainWindow.webContents.send("db-status", "red");
      }
    })
    .catch((error) => {
      console.error(`Error checking ${url}: ${error}`);
      mainWindow.webContents.send("db-status", "red");
    });
}

function showMessage(message) {
  console.log("showMessage trapped");
  console.log(message);
  if (mainWindow) {
    mainWindow.webContents.send("updateMessage", message);
  }
}

autoUpdater.on("update-available", (info) => {
  showMessage(`Update available. Download Started...`);
  let pth = autoUpdater.downloadUpdate();
  showMessage(pth);
});

autoUpdater.on("update-not-available", (info) => {
  showMessage(`Launcher version:`);
});

autoUpdater.on("update-downloaded", (info) => {
  showMessage(`Update downloaded. Restarting...`);
  autoUpdater.quitAndInstall();
});

ipcMain.on("check-for-updates", () => {
  autoUpdater.checkForUpdates();
});

autoUpdater.on("error", (info) => {
  showMessage(info);
});

app.on("ready", function () {
  createWindow();
});

ipcMain.on("close-window", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

if (require("electron-squirrel-startup")) {
  app.quit();
}

ipcMain.handle("load-games", async () => {
  try {
    return await fetchGames();
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

async function getLatestGameVersion(gameId) {
  const apiUrl =
    "https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/";

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const versions = data.objects
      .map((obj) => obj.name)
      .filter((name) =>
        name.startsWith(`${gameId}/Versions/Build-StandaloneWindows64-`)
      )
      .map((name) => {
        const versionMatch = name.match(
          /Build-StandaloneWindows64-(\d+\.\d+\.\d+)\.zip$/
        );
        return versionMatch ? versionMatch[1] : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

    const latestVersion = versions[0];
    const latestVersionUrl = `https://frks8kdvmjog.objectstorage.eu-frankfurt-1.oci.customer-oci.com/p/suRf4hOSm9II9YuoH_LuoZYletMaP59e2cIR1UXo84Pa6Hi26oo5VlWAT_XDt5R5/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/${gameId}/Versions/Build-StandaloneWindows64-${latestVersion}.zip`;

    return { latestVersion, latestVersionUrl };
  } catch (error) {
    console.error("Failed to fetch the latest game version:", error);
    throw error;
  }
}

async function checkForGameUpdates(gameId) {
  try {
    const { latestVersion } = await getLatestGameVersion(gameId);

    let installedVersion = "0.0.0";
    if (fs.existsSync(versionFilePath(gameId))) {
      const versionData = JSON.parse(
        fs.readFileSync(versionFilePath(gameId), "utf8")
      );
      installedVersion = versionData.version || "0.0.0";
    }

    if (latestVersion !== installedVersion) {
      mainWindow.webContents.send("update-available", {
        gameId,
        updateAvailable: true,
      });
    } else {
      mainWindow.webContents.send("update-available", {
        gameId,
        updateAvailable: false,
      });
    }
  } catch (error) {
    console.error("Error checking for game updates:", error);
  }
}

async function extractZip(zipPath, gameId, event) {
  const extractPath = path.join(diabolicalLauncherPath, gameId);
  try {
    await extract(zipPath, { dir: extractPath });
    fs.unlinkSync(zipPath);

    const executablePath = path.join(extractPath, "StandaloneWindows64.exe");
    event.sender.send("download-complete", gameId, executablePath);
    return executablePath;
  } catch (error) {
    console.error("Extraction error:", error);
    event.sender.send("download-error", gameId, "Extraction failed");
  }
}

ipcMain.on(
  "download-game",
  async (event, gameId, platform = "StandaloneWindows64") => {
    try {
      const { latestVersion, latestVersionUrl } = await getLatestGameVersion(
        gameId
      );

      const gameUrl = latestVersionUrl;

      const dl = await download(BrowserWindow.getFocusedWindow(), gameUrl, {
        directory: diabolicalLauncherPath,
        onProgress: (progress) => {
          const progressData = {
            gameId: gameId,
            percentage: progress.percent,
          };
          console.log("Sending download progress:", progressData);
          event.sender.send("download-progress", progressData);
        },
      });

      await extractZip(dl.getSavePath(), gameId, event);

      fs.writeFileSync(
        versionFilePath(gameId),
        JSON.stringify({ version: latestVersion })
      );

      mainWindow.webContents.send("update-available", {
        gameId,
        updateAvailable: false,
      });
    } catch (error) {
      console.error("Download or Extraction error:", error);
      event.sender.send("download-error", gameId, error.message);
    }
  }
);

ipcMain.on("open-game", (event, gameId) => {
  const gamePath = path.join(diabolicalLauncherPath, gameId);
  const executablePath = path.join(gamePath, "StandaloneWindows64.exe");

  if (!fs.existsSync(executablePath)) {
    console.error(`Executable not found at path: ${executablePath}`);
    event.sender.send(
      "game-launch-error",
      `Executable not found at path: ${executablePath}`
    );
    return;
  }

  console.log(`Launching game from path: ${executablePath}`);

  exec(`"${executablePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Failed to open game: ${error.message}`);
      console.error(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      event.sender.send(
        "game-launch-error",
        `Failed to open game: ${error.message}`
      );
    } else {
      console.log("Game launched successfully");
    }
  });
});

function getInstalledGames() {
  try {
    if (!fs.existsSync(diabolicalLauncherPath)) {
      fs.mkdirSync(diabolicalLauncherPath, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(diabolicalLauncherPath, {
      withFileTypes: true,
    });
    const installedGames = files
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    return installedGames;
  } catch (error) {
    console.error("Failed to list installed games:", error);
    return [];
  }
}

ipcMain.handle("get-installed-games", async (event) => {
  return getInstalledGames();
});
