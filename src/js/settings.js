const fs = require("fs");
const path = require("path");
const os = require("os");

//Absolute paths of the launcher
const diabolicalLauncherPath = path.join(os.homedir(), "AppData", "Local", "Diabolical Launcher");
const settingsFilePath = path.join(diabolicalLauncherPath, "settings.json");
const versionFilePath = (gameId) => path.join(diabolicalLauncherPath, `${gameId}-version.json`);


//This will be made into a better logic
const defaultSettings = {
    windowSize: {width: 1280, height: 720}, theme: "dark", language: "en",
};

//Create or use the save file logic
function initSettings() {
    if (!fs.existsSync(diabolicalLauncherPath)) {
        fs.mkdirSync(diabolicalLauncherPath, {recursive: true});
    }

    if (!fs.existsSync(settingsFilePath)) {
        saveSettings(defaultSettings);
    }
}

//Load from the save file
function loadSettings() {
    try {
        if (fs.existsSync(settingsFilePath)) {
            const data = fs.readFileSync(settingsFilePath);
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error reading settings:", error);
    }
    return defaultSettings;
}

//Save current settings
function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error("Error saving settings:", error);
    }
}

module.exports = {
    initSettings, loadSettings, saveSettings, versionFilePath, diabolicalLauncherPath, settingsFilePath,
};
