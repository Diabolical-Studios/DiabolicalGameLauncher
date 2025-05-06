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
    log('iconPath: ', path.join(__dirname, "../Resources/icon.ico"));

    /* ───────────────────────────────
       2. Create splash + main window
       ───────────────────────────────*/
    const settings = loadSettings();

    splash = new BrowserWindow({
        width: 300,
        height: 200,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        center: true,
        webPreferences: {nodeIntegration: false, contextIsolation: true},
    });
    await splash.loadFile(path.join(__dirname, "../splash.html"));

    mainWindow = new BrowserWindow({
        width: settings.windowSize.width,
        height: settings.windowSize.height,
        frame: false,
        icon: path.join(__dirname, "../Resources/icon.ico"),
        backgroundColor: "#000000",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js"),
            sandbox: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            webviewTag: false,
            spellcheck: false,
            plugins: false,
            experimentalFeatures: false,
            webgl: false,
            backgroundThrottling: false,
            devTools: process.env.NODE_ENV !== 'production',
            baseUri: 'self',
            formAction: 'self',
            frameAncestors: 'none',
            upgradeInsecureRequests: true
        },
        resizable: false,
        show: false,
    });

    // Set CSP headers
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self' https://*.diabolical.studio https://diabolical.studio https://diabolical.services https://*.github.com https://*.githubusercontent.com https://*.cloudflare.com https://*.r2.dev; " +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.diabolical.studio https://diabolical.studio https://diabolical.services https://*.github.com https://*.githubusercontent.com https://*.cloudflare.com; " +
                    "style-src 'self' 'unsafe-inline' https://*.diabolical.studio https://diabolical.studio https://diabolical.services https://*.github.com https://*.githubusercontent.com https://*.cloudflare.com https://fonts.googleapis.com; " +
                    "font-src 'self' data: https://*.diabolical.studio https://diabolical.studio https://diabolical.services https://*.github.com https://*.githubusercontent.com https://*.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com; " +
                    "img-src 'self' data: https://*.diabolical.studio https://diabolical.studio https://diabolical.services https://*.github.com https://*.githubusercontent.com https://*.cloudflare.com https://*.r2.dev; " +
                    "connect-src 'self' https://*.diabolical.studio https://diabolical.studio https://diabolical.services https://*.github.com https://*.githubusercontent.com https://*.cloudflare.com https://*.r2.dev; " +
                    "object-src 'none'; " +
                    "media-src 'self' https://*.diabolical.studio https://diabolical.studio https://diabolical.services https://*.github.com https://*.githubusercontent.com https://*.cloudflare.com https://*.r2.dev; " +
                    "frame-src 'none';"
                ]
            }
        });
    });

    // Block navigation to unauthorized domains
    mainWindow.webContents.on('will-navigate', (event, url) => {
        const parsedUrl = new URL(url);
        const allowedDomains = [
            'diabolical.studio',  // Allow root domain
            'diabolical.services',  // Allow root domain
            'github.com',
            'githubusercontent.com',
            'cloudflare.com',
            'r2.dev',
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'localhost',
        ];
        
        const isAllowed = allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain));
        if (!isAllowed) {
            event.preventDefault();
            console.warn(`Blocked navigation to unauthorized domain: ${url}`);
        }

        // Prevent navigation to file:// URLs
        if (url.startsWith('file://')) {
            event.preventDefault();
            console.warn('Blocked navigation to file:// URL');
            return;
        }
        
        // Prevent navigation to data: URLs
        if (url.startsWith('data:')) {
            event.preventDefault();
            console.warn('Blocked navigation to data: URL');
            return;
        }
    });

    // Block new window creation to unauthorized domains
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        const parsedUrl = new URL(url);
        const allowedDomains = [
            'diabolical.studio',  // Allow root domain
            'diabolical.services',  // Allow root domain
            'github.com',
            'githubusercontent.com',
            'cloudflare.com',
            'r2.dev',
            'fonts.googleapis.com',
            'fonts.gstatic.com'
        ];
        
        const isAllowed = allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain));
        if (!isAllowed) {
            console.warn(`Blocked new window to unauthorized domain: ${url}`);
            return { action: 'deny' };
        }
        return { action: 'allow' };
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

        if (process.env.NODE_ENV !== 'production') {
            mainWindow.webContents.openDevTools({ mode: 'detach' });
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
                tray = new Tray(path.join(__dirname, "../Resources/icon.ico"));
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
