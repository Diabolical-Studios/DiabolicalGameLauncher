const fs = require("fs");
const path = require("path");
const os = require("os");

const diabolicalLauncherPath = path.join(
  os.homedir(),
  "AppData",
  "Local",
  "Diabolical Launcher"
);

function getInstalledGames() {
  try {
    if (!fs.existsSync(diabolicalLauncherPath)) {
      fs.mkdirSync(diabolicalLauncherPath, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(diabolicalLauncherPath, {
      withFileTypes: true,
    });
    const installedGames = files
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    return installedGames;
  } catch (error) {
    console.error("Failed to list installed games:", error);
    return [];
  }
}

module.exports = {
  getInstalledGames,
};
