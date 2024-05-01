const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    loadGames: () => ipcRenderer.invoke('load-games'),
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