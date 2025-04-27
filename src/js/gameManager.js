const fs = require("fs");
const path = require("path");
const {Menu, shell, BrowserWindow} = require("electron");
const {downloadGame} = require("./downloadManager");
const {diabolicalLauncherPath} = require("./settings");

// Store active game sessions
const activeSessions = new Map();

//Get the size of a directory recursively
function getDirectorySize(dirPath) {
    let size = 0;
    const files = fs.readdirSync(dirPath, {withFileTypes: true});

    for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
            size += getDirectorySize(filePath);
        } else {
            size += fs.statSync(filePath).size;
        }
    }

    return size;
}

//Get the size of a game installation in bytes
function getGameSize(gameId) {
    try {
        const gamePath = path.join(diabolicalLauncherPath, gameId);
        if (!fs.existsSync(gamePath)) {
            return 0;
        }
        return getDirectorySize(gamePath);
    } catch (error) {
        console.error(`Failed to get size for game ${gameId}:`, error);
        return 0;
    }
}

// Get the path to the playtime data file
function getPlaytimeFilePath() {
    return path.join(diabolicalLauncherPath, 'playtime.json');
}

// Load playtime data from file
function loadPlaytimeData() {
    try {
        const filePath = getPlaytimeFilePath();
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Failed to load playtime data:', error);
    }
    return {};
}

// Save playtime data to file
function savePlaytimeData(data) {
    try {
        const filePath = getPlaytimeFilePath();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Failed to save playtime data:', error);
    }
}

// Start tracking playtime for a game
function startPlaytimeTracking(gameId) {
    if (!activeSessions.has(gameId)) {
        activeSessions.set(gameId, Date.now());
        console.log(`Started tracking playtime for game: ${gameId}`);
    }
}

// Stop tracking playtime for a game and update total playtime
function stopPlaytimeTracking(gameId) {
    if (activeSessions.has(gameId)) {
        const startTime = activeSessions.get(gameId);
        const endTime = Date.now();
        const sessionDuration = endTime - startTime;

        // Load current playtime data
        const playtimeData = loadPlaytimeData();

        // Update total playtime for the game
        playtimeData[gameId] = (playtimeData[gameId] || 0) + sessionDuration;

        // Save updated data
        savePlaytimeData(playtimeData);

        // Remove from active sessions
        activeSessions.delete(gameId);
        console.log(`Stopped tracking playtime for game: ${gameId}`);
    }
}

// Get total playtime for a game in hours
function getGamePlaytime(gameId) {
    const playtimeData = loadPlaytimeData();
    const totalMs = playtimeData[gameId] || 0;
    return (totalMs / (1000 * 60 * 60)).toFixed(1); // Convert to hours with 1 decimal place
}

//Get a list of game_ids which are currently installed
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

//Display a menu where the user can manage the game.
function showContextMenu(event, gameId, position) {
    const gamePath = path.join(diabolicalLauncherPath, gameId);
    const isGameInstalled = fs.existsSync(gamePath);

    const template = [];

    if (isGameInstalled) {
        template.push({
            label: "Open Game Location",
            click: () => {
                const executablePath = path.join(gamePath, "StandaloneWindows64.exe");
                shell.showItemInFolder(executablePath);
            },
        }, {
            label: "Uninstall Game",
            click: () => {
                uninstallGame(gameId);
                event.sender.send("game-uninstalled", gameId);
            },
        });
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
    if (win) {
        menu.popup({window: win, x: position.x, y: position.y});
    }
}

//Handles uninstalling game files
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
    showContextMenu,
    getGameSize,
    startPlaytimeTracking,
    stopPlaytimeTracking,
    getGamePlaytime
};
