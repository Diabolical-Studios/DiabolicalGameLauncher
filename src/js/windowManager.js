/* windowManager.js
   ---------------------------------------------------------------
   Chooses the correct site for:
   • npm start            → http://localhost:8888
   • packaged dev build   → https://dev.launcher.diabolical.studio
   • packaged prod build  → https://launcher.diabolical.studio
----------------------------------------------------------------*/
const {BrowserWindow, Tray, Menu, app} = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");
const {loadSettings, saveSettings} = require("./settings");

let mainWindow;
let splash;
let allowResize = false;
let periodicChecksStarted = false;
let tray = null;

/* ────────────────────────────────────────────────────────────────
   Simple logger to user-data folder
 ──────────────────────────────────────────────────────────────── */
const logFile = path.join(app.getPath("userData"), "debug.log");

function log(msg) {
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${msg}\n`);
}

/* ────────────────────────────────────────────────────────────────
   Resolve icon path for dev vs packaged build
 ──────────────────────────────────────────────────────────────── */
function getIconPath() {
    return app.isPackaged ? path.join(process.resourcesPath, "icons", "icon.ico") : path.join(__dirname, "../../icons/icon.ico");
}

/* ------------------------------------------------------------------
   Wait until the React dev-server answers on localhost:8888
------------------------------------------------------------------*/
async function waitForReact() {
    return new Promise((resolve) => {
        const timer = setInterval(() => {
            http
                .get("http://localhost:8888", (res) => {
                    if (res.statusCode === 200) {
                        clearInterval(timer);
                        resolve();
                    }
                })
                .on("error", () => {
                    /* server not up yet */
                });
        }, 1000);
    });
}

/* ------------------------------------------------------------------
   Main window creator
------------------------------------------------------------------*/
async function createWindow() {
    /* ───────────────────────────────
       1. Figure out the runtime mode
       ───────────────────────────────*/
// 1️⃣  Are we running from `electron .`?
    const electronIsDev = (await import('electron-is-dev')).default;
    const isLocalDev = electronIsDev || !!process.env.ELECTRON_DEV_SERVER_URL;

// 2️⃣  Read the value we injected into package.json via extraMetadata
    const pkg = require(path.join(app.getAppPath(), 'package.json'));
    const buildEnv = (pkg.env && pkg.env.NODE_ENV) || 'production';   // "development" | "production"

// 3️⃣  Decide which URL to load
    let startURL;
    if (isLocalDev) {
        startURL = 'http://localhost:8888';
        await waitForReact();
    } else {
        startURL = buildEnv === 'development' ? 'https://dev.launcher.diabolical.studio' : 'https://launcher.diabolical.studio';
    }


    log(`npm_package_env_NODE_ENV: ${buildEnv}`);
    log(`isLocalDev:               ${isLocalDev}`);
    log(`startURL:                 ${startURL}`);

    /* ───────────────────────────────
       2. Create splash + main window
       ───────────────────────────────*/
    const settings = loadSettings();
    const iconPath = getIconPath();

    splash = new BrowserWindow({
        width: 300,
        height: 200,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        center: true,
        icon: getIconPath() || undefined,
        webPreferences: {nodeIntegration: true, contextIsolation: false},
    });
    await splash.loadFile(path.join(__dirname, "../splash.html"));

    mainWindow = new BrowserWindow({
        width: settings.windowSize.width,
        height: settings.windowSize.height,
        frame: false,
        icon: getIconPath() || undefined,
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

    mainWindow.loadURL(startURL);

    /* ───────────────────────────────
       3.  Rest of original logic
       ───────────────────────────────*/
    mainWindow.webContents.on("did-finish-load", async () => {
        if (splash) {
            splash.close();
            splash = null;
        }
        mainWindow.show();

        const {
            initUpdater, startPeriodicChecks, checkForUpdates,
        } = require("./updater");
        const settings = loadSettings();
        if (settings.autoUpdate) {
            checkForUpdates();
            showMessage("Checking For Updates... ");
        }
        initUpdater();
        if (!periodicChecksStarted) {
            startPeriodicChecks(mainWindow);
            periodicChecksStarted = true;
        }
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    mainWindow.center();
    mainWindow.on("will-resize", (e) => {
        if (!allowResize) e.preventDefault();
    });

    mainWindow.on("close", (e) => {
        const settings = loadSettings();
        if (settings.minimizeToTray) {
            e.preventDefault();
            mainWindow.hide();
            if (!tray) {
                tray = new Tray(iconPath);
                const ctx = Menu.buildFromTemplate([{label: "Show Launcher", click: () => mainWindow.show()}, {
                    label: "Quit", click: () => {
                        tray.destroy();
                        tray = null;
                        app.quit();
                    },
                },]);
                tray.setToolTip("Diabolical Launcher");
                tray.setContextMenu(ctx);
                tray.on("double-click", () => mainWindow.show());
            }
        } else {
            const {width, height} = mainWindow.getContentBounds();
            settings.windowSize = {
                width: Math.round(width / 10) * 10, height: Math.round(height / 10) * 10,
            };
            saveSettings(settings);
        }
    });
}

/* ------------------------------------------------------------------ */
function showMessage(message) {
    console.log("showMessage trapped", message);
    if (mainWindow) mainWindow.webContents.send("updateMessage", message);
}

function getMainWindow() {
    return mainWindow;
}

module.exports = {createWindow, showMessage, getMainWindow};
