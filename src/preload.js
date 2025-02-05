const {contextBridge, ipcRenderer} = require("electron");
const packageJson = require("../package.json");

contextBridge.exposeInMainWorld("api", {
    loadGames: () => ipcRenderer.invoke("load-games"),
    onDbStatusChange: (callback) => {
        ipcRenderer.on("db-status", (event, status) => {
            callback(status);
        });
    },
    onUpdateMessage: (callback) => {
        ipcRenderer.on("updateMessage", (event, message) => {
            callback(message);
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

    showContextMenu: (gameId, position) => {
        ipcRenderer.send("show-context-menu", gameId, position);
    },

    getWindowSize: () => ipcRenderer.invoke("get-window-size"),
    downloadGame: (gameId) => ipcRenderer.send("download-game", gameId),
    openGame: (gameId) => ipcRenderer.send("open-game", gameId),
    loadHtml: (path) => ipcRenderer.invoke("load-html", path),
    closeWindow: () => ipcRenderer.send("close-window"),
    reloadWindow: () => ipcRenderer.send("reload-window"),
    getInstalledGames: () => ipcRenderer.invoke("get-installed-games"),

    // ✅ Fixed: Now properly listens for download progress
    onDownloadProgress: (callback) => {
        ipcRenderer.on("download-progress", (event, { gameId, percentage }) => {
            callback({ gameId, percentage });
        });
    },

    // ✅ Fixed: Now properly listens for download completion
    onDownloadComplete: (callback) => {
        ipcRenderer.on("download-complete", (event, gameId, installPath) => {
            callback({ gameId, installPath });
        });
    },

    onGameUninstalled: (callback) => {
        ipcRenderer.on("game-uninstalled", (event, gameId) => {
            callback(gameId);
        });
    }
});

let bridge = {
    updateMessage: (callback) => ipcRenderer.on("updateMessage", callback),
};

contextBridge.exposeInMainWorld("bridge", bridge);
