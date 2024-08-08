const fs = require("fs");
const path = require("path");
const os = require("os");

const diabolicalLauncherPath = path.join(
  os.homedir(),
  "AppData",
  "Local",
  "Diabolical Launcher"
);

const versionFilePath = (gameId) => path.join(diabolicalLauncherPath, `${gameId}-version.json`);

const settingsFilePath = path.join(diabolicalLauncherPath, "settings.json");

const defaultSettings = {
  windowSize: { width: 1280, height: 720 },
  theme: "light",
  language: "en",
};

function initSettings() {
  if (!fs.existsSync(diabolicalLauncherPath)) {
    fs.mkdirSync(diabolicalLauncherPath, { recursive: true });
  }

  if (!fs.existsSync(settingsFilePath)) {
    saveSettings(defaultSettings);
  }
}

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

function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

module.exports = {
  initSettings,
  loadSettings,
  saveSettings,
  versionFilePath,
  diabolicalLauncherPath,
  settingsFilePath,
};
