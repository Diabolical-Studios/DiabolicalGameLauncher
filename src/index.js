const { app } = require("electron");
const { createWindow } = require("./js/windowManager");
const { initSettings } = require("./js/settings");
const { initUpdater } = require("./js/updater");
const { initIPCHandlers } = require("./js/ipcHandlers");

app.on("ready", () => {
  initSettings();
  createWindow();
  initIPCHandlers();
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

if (require("electron-squirrel-startup")) {
  app.quit();
}
