const fs = require("fs");
const path = require("path");
const os = require("os");
const { Menu, shell, BrowserWindow } = require("electron");

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

function showContextMenu(event, gameId, position) {
  const template = [
    {
      label: "Open Game Location",
      click: () => {
        const executablePath = path.join(diabolicalLauncherPath, gameId, "StandaloneWindows64.exe");
        shell.showItemInFolder(executablePath);
      },
    },
    {
      label: "Uninstall Game",
      click: () => {
        uninstallGame(gameId);
      },
    },
    {
      label: "Cancel",
      role: "cancel",
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  const win = BrowserWindow.fromWebContents(event.sender);
  menu.popup({ window: win, x: position.x, y: position.y });
}

function uninstallGame(gameId) {
  const gamePath = path.join(diabolicalLauncherPath, gameId);
  if (fs.existsSync(gamePath)) {
    fs.rmdirSync(gamePath, { recursive: true });
    console.log(`Uninstalled game with ID: ${gameId}`);
    // Notify the renderer process if needed
    BrowserWindow.getFocusedWindow().webContents.send('game-uninstalled', gameId);
  } else {
    console.error(`Game with ID: ${gameId} not found.`);
  }
}

module.exports = {
  getInstalledGames,
  showContextMenu,  // Export the function to show the context menu
};
