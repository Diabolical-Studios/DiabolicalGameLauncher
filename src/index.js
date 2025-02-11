const { app } = require("electron");
const { createWindow } = require("./js/windowManager");
const { initSettings } = require("./js/settings");
const { initIPCHandlers } = require("./js/ipcHandlers");
const path = require("path");
const os = require("os");

// Update launcherExecutablePath to point directly to the executable
const launcherExecutablePath = path.join(
  os.homedir(),
  "AppData",
  "Local",
  "Programs",
  "diabolicallauncher",
  "Diabolical Launcher.exe" // Add the executable name
);

app.on("ready", () => {
  initSettings();
  createWindow();
  initIPCHandlers();

  // Dynamically set the protocol registration
  const executablePath =
    process.defaultApp && process.argv.includes("--no-sandbox")
      ? process.execPath // Path to Electron binary (development mode)
      : launcherExecutablePath; // Path to the installed app executable

  app.setAsDefaultProtocolClient("diabolicallauncher", executablePath);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (require("./js/windowManager").getMainWindow() === null) {
    createWindow();
  }
});

app.on("second-instance", (event, argv) => {
  const url = argv.find(arg => arg.startsWith("diabolicallauncher://"));
  if (url) {
    console.log("Received Protocol URL:", url);

    // Extract parameters from the URL
    const params = new URL(url);
    const sessionID = params.searchParams.get("sessionID");
    const username = params.searchParams.get("username");

    if (sessionID && username) {
      const mainWindow = require("./js/windowManager").getMainWindow();
      if (mainWindow) {
        // Send extracted data to the renderer process
        mainWindow.webContents.send("protocol-data", { sessionID, username });
        mainWindow.focus();
      }
    }
  }
});

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, argv) => {
    const url = argv.find(arg => arg.startsWith("diabolicallauncher://"));
    if (url) {
      const mainWindow = require("./js/windowManager").getMainWindow();
      if (mainWindow) {
        mainWindow.webContents.send("protocol-url", url);
        mainWindow.focus();
      }
    }
  });
}
