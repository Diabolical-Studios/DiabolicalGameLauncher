const { BrowserWindow } = require("electron");
const path = require("path");
const { loadSettings, saveSettings } = require("./settings");

let mainWindow;
let allowResize = false;

function createWindow() {
  const settings = loadSettings();

  mainWindow = new BrowserWindow({
    width: settings.windowSize.width,
    height: settings.windowSize.height,
    frame: false,
    icon: path.join(__dirname, "../Resources/icon.ico"), // Update this path as necessary
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "../preload.js"),
    },
    resizable: true,
  });

  mainWindow.loadURL(`file://${path.join(__dirname, "../index.html")}`);

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
    // Initialize the updater and pass the mainWindow
    const { initUpdater, startPeriodicChecks } = require("./updater");
    require("./updater").checkForUpdates();
    require("./database").pingDatabase("https://objectstorage.eu-frankfurt-1.oraclecloud.com/p/gusB9LXo4v8-qUja7OPfq1BSteoEnzVIrUprDXuBV5EznaV-IEIlE9uuikYnde4x/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/");

    initUpdater();
    startPeriodicChecks(mainWindow); // Check game updates periodically
  
    // Send a message to the renderer (index.html) that we're checking for updates
    showMessage(`Checking For Updates... `);
    
  });


  setInterval(() => {
    require("./database").pingDatabase("https://objectstorage.eu-frankfurt-1.oraclecloud.com/p/gusB9LXo4v8-qUja7OPfq1BSteoEnzVIrUprDXuBV5EznaV-IEIlE9uuikYnde4x/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/");
  }, 60000);

  mainWindow.on("close", () => {
    const { width, height } = mainWindow.getContentBounds();
    settings.windowSize = {
      width: Math.round(width / 10) * 10,
      height: Math.round(height / 10) * 10,
    };
    saveSettings(settings);
  });
}

function showMessage(message) {
  console.log("showMessage trapped");
  console.log(message);
  if (mainWindow) {
    mainWindow.webContents.send("updateMessage", message);
  }
}

function getMainWindow() {
  return mainWindow;
}

module.exports = {
  createWindow,
  showMessage,
  getMainWindow,
};
