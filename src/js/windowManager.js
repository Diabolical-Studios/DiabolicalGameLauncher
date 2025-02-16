const {BrowserWindow} = require("electron");
const path = require("path");
const {loadSettings, saveSettings} = require("./settings");
let mainWindow;
let splash;
let allowResize = false;
let periodicChecksStarted = false;

async function createWindow() {
    const isDev = (await import("electron-is-dev")).default;
    const settings = loadSettings();
    
    //Creates the splash window while the launcher loads
    splash = new BrowserWindow({
        width: 300, height: 200, frame: false, transparent: true, alwaysOnTop: true, center: true, webPreferences: {
            nodeIntegration: true, contextIsolation: false
        }
    });
    await splash.loadFile(path.join(__dirname, "../splash.html"));
    
    //Creates the main window and hides it until its ready
    mainWindow = new BrowserWindow({
        width: settings.windowSize.width,
        height: settings.windowSize.height,
        frame: false,
        icon: path.join(__dirname, "../Resources/icon.ico"),
        backgroundColor: "#000000",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        },
        resizable: false,
        show: false
    });
    
    //Dev mode = localhost
    const startURL = isDev ? "http://localhost:8888" : "https://launcher.diabolical.studio";
    mainWindow.loadURL(startURL);
    
    //Close splash window and enable main window
    mainWindow.once("ready-to-show", () => {
        if (splash) {
            splash.close();
            splash = null;
        }
        mainWindow.show();
    });
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    mainWindow.center();
    mainWindow.on("will-resize", (e) => {
        if (!allowResize) {
            e.preventDefault();
        }
    });
    
    mainWindow.webContents.on("did-finish-load", async () => {
        if (splash) {
            splash.webContents.send("splash-update", "Initializing modules...");
        }
        const {initUpdater, startPeriodicChecks, checkForUpdates} = require("./updater");
        checkForUpdates();
        require("./database").pingDatabase("https://objectstorage.eu-frankfurt-1.oraclecloud.com/p/gusB9LXo4v8-qUja7OPfq1BSteoEnzVIrUprDXuBV5EznaV-IEIlE9uuikYnde4x/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/");
        initUpdater();
        if (!periodicChecksStarted) {
            startPeriodicChecks(mainWindow);
            periodicChecksStarted = true;
        }
        showMessage("Checking For Updates... ");
    });
    
    //Display database health
    setInterval(() => {
        require("./database").pingDatabase("https://objectstorage.eu-frankfurt-1.oraclecloud.com/p/gusB9LXo4v8-qUja7OPfq1BSteoEnzVIrUprDXuBV5EznaV-IEIlE9uuikYnde4x/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/");
    }, 60000);
    mainWindow.on("close", () => {
        const {width, height} = mainWindow.getContentBounds();
        settings.windowSize = {
            width: Math.round(width / 10) * 10, height: Math.round(height / 10) * 10
        };
        saveSettings(settings);
    });
}

function showMessage(message) {
    console.log("showMessage trapped", message);
    if (getMainWindow()) {
        getMainWindow().webContents.send("updateMessage", message);
    }
}

function getMainWindow() {
    return mainWindow;
}

module.exports = {createWindow, showMessage, getMainWindow};
