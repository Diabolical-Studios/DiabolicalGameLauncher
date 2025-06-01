const { app, Menu } = require('electron');

Menu.setApplicationMenu(null);
const path = require('path');
const os = require('os');
const { createWindow } = require('./js/windowManager');
const { getMainWindow } = require('./js/windowStore');
const { initSettings } = require('./js/settings');
const { initIPCHandlers } = require('./js/ipcHandlers');

const launcherExecutablePath = path.join(
  os.homedir(),
  'AppData',
  'Local',
  'Programs',
  'buildsmith',
  'Buildsmith.exe'
);

app.on('ready', () => {
  initSettings();
  createWindow();
  initIPCHandlers();

  const executablePath =
    process.defaultApp && process.argv.includes('--no-sandbox')
      ? process.execPath
      : launcherExecutablePath;

  app.setAsDefaultProtocolClient('buildsmith', executablePath);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (getMainWindow() === null) {
    createWindow();
  }
});

app.on('second-instance', (event, argv) => {
  const url = argv.find(arg => arg.startsWith('buildsmith://'));

  if (url) {
    console.log('Received Protocol URL:', url);

    const params = new URL(url);
    const action = params.hostname;

    const data = {};
    params.searchParams.forEach((value, key) => {
      data[key] = value;
    });

    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.webContents.send('protocol-data', { action, data });
      mainWindow.focus();
    }
  }
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv) => {
    const url = argv.find(arg => arg.startsWith('buildsmith://'));
    if (url) {
      const mainWindow = getMainWindow();
      if (mainWindow) {
        mainWindow.webContents.send('protocol-url', url);
        mainWindow.focus();
      }
    }
  });
}
