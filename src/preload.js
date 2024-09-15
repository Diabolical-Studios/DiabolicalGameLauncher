const { contextBridge, ipcRenderer } = require("electron");
const packageJson = require("../package.json");

contextBridge.exposeInMainWorld("api", {
  loadGames: () => ipcRenderer.invoke("load-games"),
  onDbStatusChange: (callback) => {
    ipcRenderer.on("db-status", (event, status) => {
      callback(status);
    });
  },
});

contextBridge.exposeInMainWorld("versions", {
  appVersion: packageJson.version,
});

contextBridge.exposeInMainWorld("electronAPI", {
  setWindowSize: (width, height) => {
    ipcRenderer.send("set-window-size-and-center", width, height);
  },
  // Expose a notification listener
  onNotification: (callback) => {
    ipcRenderer.on("show-notification", (event, data) => {
      callback(data); // Pass the data to the renderer
    });
  },
  showContextMenu: (gameId, position) => {
    ipcRenderer.send("show-context-menu", gameId, position);
  },
  getWindowSize: () => ipcRenderer.invoke("get-window-size"),
  downloadGame: (gameId) => ipcRenderer.send("download-game", gameId),
  openGame: (path) => ipcRenderer.send("open-game", path),
  loadHtml: (path) => ipcRenderer.invoke("load-html", path),
  closeWindow: () => ipcRenderer.send("close-window"),
  reloadWindow: () => ipcRenderer.send("reload-window"),
  getInstalledGames: () => ipcRenderer.invoke("get-installed-games"),

  // Listen for the 'game-uninstalled' event
  onGameUninstalled: (callback) => {
    ipcRenderer.on("game-uninstalled", (event, gameId) => {
      callback(gameId);
    });
  },

  onDownloadComplete: (game_id, installPath) =>
    ipcRenderer.on("download-complete", game_id, installPath),
  onDownloadProgress: (game_id, percentage) =>
    ipcRenderer.on("download-progress", game_id, percentage),
});

let bridge = {
  updateMessage: (callback) => ipcRenderer.on("updateMessage", callback),
};

contextBridge.exposeInMainWorld("bridge", bridge);
