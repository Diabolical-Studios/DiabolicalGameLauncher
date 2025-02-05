const fs = require("fs");
const path = require("path");
const os = require("os");
const {Menu, shell, BrowserWindow} = require("electron");
const {downloadGame} = require("./downloadManager");
const {diabolicalLauncherPath} = require("./settings");

function getInstalledGames() {
    try {
        if (!fs.existsSync(diabolicalLauncherPath)) {
            fs.mkdirSync(diabolicalLauncherPath, {recursive: true});
            return [];
        }

        const files = fs.readdirSync(diabolicalLauncherPath, {
            withFileTypes: true,
        });
        return files
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);
    } catch (error) {
        console.error("Failed to list installed games:", error);
        return [];
    }
}

function showContextMenu(event, gameId, position) {
    const gamePath = path.join(diabolicalLauncherPath, gameId);
    const isGameInstalled = fs.existsSync(gamePath);

    const template = [];

    if (isGameInstalled) {
        template.push(
            {
                label: "Open Game Location",
                click: () => {
                    const executablePath = path.join(gamePath, "StandaloneWindows64.exe");
                    shell.showItemInFolder(executablePath);
                },
            },
            {
                label: "Uninstall Game",
                click: () => {
                    uninstallGame(gameId);
                    event.sender.send("download-complete", gameId); // Notify frontend
                },
            }
        );
    } else {
        template.push({
            label: "Download Game",
            click: () => {
                downloadGame(event, gameId);
            },
        });
    }

    template.push({
        label: "Cancel",
        role: "cancel",
    });

    const menu = Menu.buildFromTemplate(template);
    const win = BrowserWindow.fromWebContents(event.sender);
    menu.popup({ window: win, x: position.x, y: position.y });
}


function uninstallGame(gameId) {
    const gamePath = path.join(diabolicalLauncherPath, gameId);
    if (fs.existsSync(gamePath)) {
        fs.rmSync(gamePath, {recursive: true});
        console.log(`Uninstalled game with ID: ${gameId}`);
    } else {
        console.error(`Game with ID: ${gameId} not found.`);
    }
}

module.exports = {
    uninstallGame,
    getInstalledGames,
    showContextMenu
};
