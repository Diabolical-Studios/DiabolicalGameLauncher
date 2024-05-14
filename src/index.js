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
const axios = require('axios');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let allowResize = false;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,  // This makes the window frameless
    icon: 'path/to/your/icon.ico', // Set the window icon
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    resizable: true  // This prevents the window from being resizable
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.center();

  mainWindow.on('will-resize', (e) => {
    if (!allowResize) {
      e.preventDefault();
    }
  });

  // Adjusted usage
  mainWindow.webContents.on('did-finish-load', () => {
    autoUpdater.checkForUpdates();
    pingDatabase('https://diabolical.studio'); // Use your site's URL here
    showMessage(`Checking for updates...`);
  });

  // Ping the site every 10 seconds to check status
  setInterval(() => {
    pingDatabase('https://diabolical.studio'); // Use your site's URL here
  }, 60000); // Adjust the interval as needed
};

function pingDatabase(url) {
  axios.get(url)
    .then(response => {
      // Check for a successful response status code (200-299)
      if (response.status >= 200 && response.status < 300) {
        console.log(`Website ${url} is up! Status Code: ${response.status}`);
        mainWindow.webContents.send('db-status', 'rgb(72, 216, 24)'); // Green, site is up
      } else {
        console.log(`Website ${url} returned status code ${response.status}`);
        mainWindow.webContents.send('db-status', 'red'); // Red, site has issues
      }
    })
    .catch(error => {
      console.error(`Error checking ${url}: ${error}`);
      mainWindow.webContents.send('db-status', 'red'); // Red, site is down or unreachable
    });
}

// A function to handle showing messages and sending them to the renderer
function showMessage(message) {
  console.log("showMessage trapped");
  console.log(message);
  if (mainWindow) {
    mainWindow.webContents.send("updateMessage", message);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
/*New Update Available*/
autoUpdater.on("update-available", (info) => {
  showMessage(`Update available. Download Started...`);
  let pth = autoUpdater.downloadUpdate();
  showMessage(pth);
});

autoUpdater.on("update-not-available", (info) => {
  showMessage(`Launcher version:`);
});

/*Download Completion Message*/
autoUpdater.on("update-downloaded", (info) => {
  showMessage(`Update downloaded. Restarting...`);
  autoUpdater.quitAndInstall();
});

// Listen for an 'check-for-updates' message from the renderer
ipcMain.on('check-for-updates', () => {
  autoUpdater.checkForUpdates();
});

autoUpdater.on("error", (info) => {
  showMessage(info);
});

app.on('ready', function () {
  createWindow();
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


async function extractZip(zipPath, gameId, event) {
  const extractPath = path.join(diabolicalLauncherPath, gameId);
  try {
    await extract(zipPath, { dir: extractPath });
    fs.unlinkSync(zipPath); // Delete the zip file after extraction

    // Construct the new executable path
    const executablePath = path.join(extractPath, 'StandaloneWindows64.exe');
    event.sender.send('download-complete', gameId, executablePath);
    return executablePath;
  } catch (error) {
    console.error('Extraction error:', error);
    event.sender.send('download-error', gameId, 'Extraction failed');
  }
}


// Handle download-game event
ipcMain.on('download-game', async (event, gameId, platform = 'StandaloneWindows64', gameVersion = '0.0.1') => {
  const gameUrl = `https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/${gameId}/Versions/Build-${platform}-${gameVersion}.zip`;

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

ipcMain.on('set-window-size-and-center', (event, width, height) => {
  if (mainWindow) {
    allowResize = true;  // Temporarily enable resizing
    mainWindow.setSize(width, height);
    mainWindow.center();
    console.log(`Window size set to: ${width}x${height} and centered`);
    allowResize = false;  // Temporarily enable resizing

  } else {
    console.log("Main window is not accessible.");
  }
});