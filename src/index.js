//index.js

const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { download } = require('electron-dl');
const extract = require('extract-zip');
const { fetchGames } = require('./js/database');
const oracledb = require('oracledb');
const { exec } = require('child_process');


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

  // Ping database server every 10 seconds to check status
  setInterval(() => {
    pingDatabase('89.168.71.146');
  }, 10000); // Adjust the interval as needed
};

function pingDatabase(ip) {
  exec(`ping -n 1 ${ip}`, { env: process.env }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Exec error: ${error}`);
      mainWindow.webContents.send('db-status', 'red');
      return;
    }
    console.log(`stdout: ${stdout}`);
    if (stdout.includes("Received = 1")) {
      mainWindow.webContents.send('db-status', 'rgb(72, 216, 24)');
    } else {
      mainWindow.webContents.send('db-status', 'red');
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});


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


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

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


//DownloadManager
// Define the path to the DiabolicalLauncher directory
const diabolicalLauncherPath = path.join(os.homedir(), 'AppData', 'Local', 'Diabolical Launcher');


// Extracts the downloaded zip file
async function extractZip(zipPath, gameId, event) {
  const extractPath = path.join(diabolicalLauncherPath, gameId);
  try {
    await extract(zipPath, { dir: extractPath });
    fs.unlinkSync(zipPath); // Delete the zip file after extraction
    const executablePath = path.join(extractPath, `${gameId}.exe`);
    event.sender.send('download-complete', gameId, executablePath);
    return executablePath;
  } catch (error) {
    console.error('Extraction error:', error);
    event.sender.send('download-error', gameId, 'Extraction failed');
  }
}

// Handle download-game event
ipcMain.on('download-game', async (event, gameId) => {
  const gameUrl = `https://api.diabolical.studio/${gameId}/${gameId}.zip`;

  try {
    const dl = await download(BrowserWindow.getFocusedWindow(), gameUrl, {
      directory: diabolicalLauncherPath,
      onProgress: (progress) => {
        const progressData = {
          gameId: gameId,
          percentage: progress.percent
        };
        console.log("Sending download progress:", progressData);
        event.sender.send('download-progress', progressData);
      }
    });
    await extractZip(dl.getSavePath(), gameId, event);
  } catch (error) {
    console.error('Download or Extraction error:', error);
    event.sender.send('download-error', gameId, error.message);
  }
});


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

function getInstalledGames() {
  try {
    // Ensure the directory exists
    if (!fs.existsSync(diabolicalLauncherPath)) {
      fs.mkdirSync(diabolicalLauncherPath, { recursive: true });
      return [];
    }

    // Read the directory contents
    const files = fs.readdirSync(diabolicalLauncherPath, { withFileTypes: true });
    // Filter directories and return their names
    const installedGames = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    return installedGames;
  } catch (error) {
    console.error("Failed to list installed games:", error);
    return [];
  }
}

// Expose this function to the renderer process via IPC
ipcMain.handle('get-installed-games', async (event) => {
  return getInstalledGames();
});