const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    loadGames: () => ipcRenderer.invoke('load-games'),
});
