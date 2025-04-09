module.exports = {
    app: {
        getPath: jest.fn(),
        getVersion: jest.fn(),
    },
    BrowserWindow: {
        getFocusedWindow: jest.fn(),
        fromWebContents: jest.fn(),
    },
    Menu: {
        buildFromTemplate: jest.fn(),
    },
    shell: {
        showItemInFolder: jest.fn(),
        openExternal: jest.fn(),
    },
    ipcMain: {
        on: jest.fn(),
        handle: jest.fn(),
    },
    ipcRenderer: {
        on: jest.fn(),
        send: jest.fn(),
        invoke: jest.fn(),
    },
}; 