const {contextBridge, ipcRenderer, shell} = require("electron");
const packageJson = require("../package.json");

contextBridge.exposeInMainWorld("api", {
    loadGames: () => ipcRenderer.invoke("load-games"), onDbStatusChange: (callback) => {
        ipcRenderer.on("db-status", (event, status) => {
            callback(status);
        });
    }, onUpdateMessage: (callback) => {
        ipcRenderer.on("updateMessage", (event, message) => {
            callback(message);
        });
    },
});

contextBridge.exposeInMainWorld("versions", {
    getAppVersion: () => ipcRenderer.invoke("get-app-version")
});

contextBridge.exposeInMainWorld("electronAPI", {
    onProtocolData: (callback) => {
        ipcRenderer.on("protocol-data", (event, { action, data }) => {
            callback(action, data);
        });
    },
    
    setWindowSize: (width, height) => {
        ipcRenderer.send("set-window-size-and-center", width, height);
    },

    openExternal: (url) => shell.openExternal(url),

    onNotification: (callback) => {
        ipcRenderer.on("show-notification", (event, data) => {
            callback(data);
        });
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

    onDownloadProgress: (callback) => {
        ipcRenderer.on("download-progress", (event, {gameId, percentage}) => {
            callback({gameId, percentage});
        });
    },

    onDownloadComplete: (callback) => {
        ipcRenderer.on("download-complete", (event, gameId, installPath) => {
            callback({gameId, installPath});
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
