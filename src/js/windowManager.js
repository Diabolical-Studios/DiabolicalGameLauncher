const { BrowserWindow } = require("electron");
const path = require("path");
const { loadSettings, saveSettings } = require("./settings");

let mainWindow;
let splash;
let allowResize = false;

async function createWindow() {
    const isDev = (await import("electron-is-dev")).default;
    const settings = loadSettings();

    // Create splash window with nodeIntegration enabled for IPC in splash
    splash = new BrowserWindow({
        width: 300,
        height: 200,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    await splash.loadFile(path.join(__dirname, "../splash.html"));

    // Create the main window but hide it until ready
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
            preload: path.join(__dirname, "../preload.js"),
        },
        resizable: false,
        show: false,
    });

    const startURL = isDev
        ? "http://localhost:8888"
        : "https://launcher.diabolical.studio";

    mainWindow.loadURL(startURL);

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
        // Example: send an update to splash (if it were still open)
        if (splash) {
            splash.webContents.send("splash-update", "Initializing modules...");
        }
        const { initUpdater, startPeriodicChecks } = require("./updater");
        require("./updater").checkForUpdates();
        require("./database").pingDatabase("https://objectstorage.eu-frankfurt-1.oraclecloud.com/p/gusB9LXo4v8-qUja7OPfq1BSteoEnzVIrUprDXuBV5EznaV-IEIlE9uuikYnde4x/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/");
        initUpdater();
        startPeriodicChecks(mainWindow);
        showMessage(`Checking For Updates... `);
    });

    setInterval(() => {
        require("./database").pingDatabase("https://objectstorage.eu-frankfurt-1.oraclecloud.com/p/gusB9LXo4v8-qUja7OPfq1BSteoEnzVIrUprDXuBV5EznaV-IEIlE9uuikYnde4x/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/");
    }, 60000);

    mainWindow.on("close", () => {
        const { width, height } = mainWindow.getContentBounds();
        settings.windowSize = {
            width: Math.round(width / 10) * 10,
            height: Math.round(height / 10) * 10,
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

module.exports = {
    createWindow,
    showMessage,
    getMainWindow,
};
