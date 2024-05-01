//index.js

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { download } = require('electron-dl');
const extract = require('extract-zip');
const { fetchGames } = require('./js/database');
const oracledb = require('oracledb');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    frame: false,  // This makes the window frameless
    icon: 'path/to/your/icon.ico', // Set the window icon
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    resizable: false  // This prevents the window from being resizable
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Define the path to the DiabolicalLauncher directory
const diabolicalLauncherPath = path.join(os.homedir(), 'AppData', 'Local', 'Diabolical Launcher');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Handle download-game event
ipcMain.on('download-game', async (event, gameId) => {
  const gameUrl = `https://api.diabolical.studio/${gameId}.zip`;

  download(BrowserWindow.getFocusedWindow(), gameUrl, {
    directory: diabolicalLauncherPath
  }).then(dl => {
    extractZip(dl.getSavePath(), gameId)
      .then(installPath => {
        event.sender.send('download-complete', gameId, installPath);
      })
      .catch(error => {
        console.error('Extraction error:', error);
      });
  }).catch(error => {
    console.error('Download error:', error);
  });
});


async function extractZip(zipPath, gameId) {
  const extractPath = path.join(diabolicalLauncherPath, gameId);
  await extract(zipPath, { dir: extractPath });
  fs.unlinkSync(zipPath); // Delete the zip file after extraction
  // Assuming the main executable is always named gameId.exe
  const executablePath = path.join(extractPath, `${gameId}.exe`);
  return executablePath;
}

// Handle open-game event
ipcMain.on('open-game', (event, gameExecutablePath) => {
  const { exec } = require('child_process');
  exec(`"${gameExecutablePath}"`, (error) => {
    if (error) {
      // Handle errors here
      console.error('Failed to open game:', error);
    }
  });
});

ipcMain.handle('load-games', async () => {
  try {
    return await fetchGames();
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return [];
  }
});

ipcMain.handle('load-html', async (event, filePath) => {
  const fullPath = path.join(app.getAppPath(), filePath);
  return fs.promises.readFile(fullPath, 'utf8').catch(error => console.error(error));
});