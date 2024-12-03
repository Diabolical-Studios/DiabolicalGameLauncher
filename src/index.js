const { app } = require("electron");
const { createWindow, getMainWindow } = require("./js/windowManager");
const { initSettings } = require("./js/settings");
const { initIPCHandlers } = require("./js/ipcHandlers");

let deepLinkingUrl = null; // Stores the protocol URL

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, argv) => {
    // Protocol handling for second instances (Windows/Linux)
    const url = getProtocolUrl(argv);
    if (url) {
      deepLinkingUrl = url;
      processProtocolUrl(url);
    }

    // Focus existing window
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on("ready", () => {
    initSettings();
    const mainWindow = createWindow();
    initIPCHandlers();

    // Protocol handling for first instance
    const url = getProtocolUrl(process.argv);
    if (url) {
      deepLinkingUrl = url;
      processProtocolUrl(url);
    }
  });

  app.on("open-url", (event, url) => {
    // macOS-specific protocol handling
    event.preventDefault();
    deepLinkingUrl = url;
    processProtocolUrl(url);
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (!getMainWindow()) {
      createWindow();
    }
  });
}

// Helper function to extract protocol URL
function getProtocolUrl(args) {
  if (!args) return null;
  return args.find(arg => arg.startsWith("diabolicallauncher://"));
}

// Helper function to process protocol URL
function processProtocolUrl(url) {
  console.log(`Processing protocol URL: ${url}`);
  const mainWindow = getMainWindow();
  if (mainWindow) {
    mainWindow.webContents.send("protocol-url", url); // Send URL to renderer process
  } else {
    // Handle if window isn't ready yet
    app.whenReady().then(() => {
      createWindow().webContents.once("did-finish-load", () => {
        mainWindow.webContents.send("protocol-url", url);
      });
    });
  }
}
