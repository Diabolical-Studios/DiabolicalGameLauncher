const {contextBridge, ipcRenderer, shell} = require("electron");

contextBridge.exposeInMainWorld("api", {
    onDbStatusChange: (callback) => {
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
    //Game Actions
    downloadGame: (gameId) => ipcRenderer.send("download-game", gameId),
    openGame: (gameId) => ipcRenderer.send("open-game", gameId),
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
    },
    showContextMenu: (gameId, position) => {
        ipcRenderer.send("show-context-menu", gameId, position);
    },

    //Window
    closeWindow: () => ipcRenderer.send("close-window"),
    reloadWindow: () => ipcRenderer.send("reload-window"),
    getWindowSize: () => ipcRenderer.invoke("get-window-size"),
    setWindowSize: (width, height) => {
        ipcRenderer.send("set-window-size-and-center", width, height);
    },

    //API
    openExternal: (url) => shell.openExternal(url),
    showCustomNotification: (title, body, gameId) => ipcRenderer.send("show-notification", {title, body, gameId}),
    onNotification: (callback) => {
        ipcRenderer.on("show-notification", (event, data) => callback(data));
    },
    onProtocolData: (callback) => {
        ipcRenderer.on("protocol-data", (event, {action, data}) => {
            callback(action, data);
        });
    },
});

contextBridge.exposeInMainWorld("githubAPI", {
    fetchWorkflows: (repoFullName, accessToken) => ipcRenderer.invoke("fetch-github-workflows", repoFullName, accessToken),
    fetchLogs: (repoFullName, runId, accessToken) => ipcRenderer.invoke("fetch-github-logs", repoFullName, runId, accessToken),
});

let bridge = {
    updateMessage: (callback) => ipcRenderer.on("updateMessage", callback),
};

contextBridge.exposeInMainWorld("bridge", bridge);
