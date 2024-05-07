//preload.js

const { contextBridge, ipcRenderer } = require('electron');
const packageJson = require('../package.json'); // Adjust path as necessary


contextBridge.exposeInMainWorld('api', {
    loadGames: () => ipcRenderer.invoke('load-games'),
    onDbStatusChange: (callback) => {
        ipcRenderer.on('db-status', (event, status) => {
            callback(status);
        });
    }
});

contextBridge.exposeInMainWorld('versions', {
    appVersion: packageJson.version
});

contextBridge.exposeInMainWorld('electronAPI', {
    downloadGame: (gameId) => ipcRenderer.send('download-game', gameId),
    openGame: (path) => ipcRenderer.send('open-game', path),
    loadHtml: (path) => ipcRenderer.invoke('load-html', path),
    closeWindow: () => ipcRenderer.send('close-window'),
    getInstalledGames: () => ipcRenderer.invoke('get-installed-games'),
    onDownloadComplete: (game_id, installPath) => ipcRenderer.on('download-complete', game_id, installPath),
    onDownloadProgress: (game_id, percentage) => ipcRenderer.on('download-progress', game_id, percentage)
});

let bridge = {
    updateMessage: (callback) => ipcRenderer.on("updateMessage", callback),
  };
  
  contextBridge.exposeInMainWorld("bridge", bridge);