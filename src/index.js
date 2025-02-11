const {app} = require("electron");
const {createWindow} = require("./js/windowManager");
const {initSettings} = require("./js/settings");
const {initIPCHandlers} = require("./js/ipcHandlers");
const path = require("path");
const os = require("os");

const launcherExecutablePath = path.join(
    os.homedir(),
    "AppData",
    "Local",
    "Programs",
    "diabolicallauncher",
    "Diabolical Launcher.exe"
);

app.on("ready", () => {
    initSettings();
    createWindow();
    initIPCHandlers();

    const executablePath =
        process.defaultApp && process.argv.includes("--no-sandbox")
            ? process.execPath
            : launcherExecutablePath;

    app.setAsDefaultProtocolClient("diabolicallauncher", executablePath);
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (require("./js/windowManager").getMainWindow() === null) {
        createWindow();
    }
});

app.on("second-instance", (event, argv) => {
    const url = argv.find(arg => arg.startsWith("diabolicallauncher://"));

    if (url) {
        console.log("Received Protocol URL:", url);

        const params = new URL(url);
        const action = params.hostname;

        let data = {};
        params.searchParams.forEach((value, key) => {
            data[key] = value;
        });

        const mainWindow = require("./js/windowManager").getMainWindow();
        if (mainWindow) {
            mainWindow.webContents.send("protocol-data", {action, data});
            mainWindow.focus();
        }
    }
});


const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", (event, argv) => {
        const url = argv.find(arg => arg.startsWith("diabolicallauncher://"));
        if (url) {
            const mainWindow = require("./js/windowManager").getMainWindow();
            if (mainWindow) {
                mainWindow.webContents.send("protocol-url", url);
                mainWindow.focus();
            }
        }
    });
}
