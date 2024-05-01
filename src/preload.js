const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    loadGames: () => ipcRenderer.invoke('load-games'),
});

contextBridge.exposeInMainWorld('electronAPI', {
    closeWindow: () => ipcRenderer.send('close-window'),
    loadHtml: (filePath) => ipcRenderer.invoke('load-html', filePath)

});