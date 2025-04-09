const fs = require("fs");
const path = require("path");
const {BrowserWindow} = require("electron");
const {download} = require("electron-dl");
const extract = require("extract-zip");
const {diabolicalLauncherPath, versionFilePath} = require("./settings");
const {getMainWindow} = require("./windowManager");
const {getLatestGameVersion} = require("./versionChecker");

//Extract zip content after download
async function extractZip(zipPath, gameId, event) {
    const extractPath = path.join(diabolicalLauncherPath, gameId);
    try {
        await extract(zipPath, {dir: extractPath});
        fs.unlinkSync(zipPath);

        event.sender.send("download-complete", gameId);
        return extractPath;
    } catch (error) {
        console.error("Extraction error:", error);
        event.sender.send("download-error", gameId, "Extraction failed");
    }
}

//Initiate game download
async function downloadGame(event, gameId) {
    try {
        console.log(`Starting download process for game: ${gameId}`);
        const {latestVersion, latestVersionUrl} = await getLatestGameVersion(gameId);
        console.log(`Got version info - Latest: ${latestVersion}, URL: ${latestVersionUrl}`);

        if (!latestVersion || !latestVersionUrl) {
            const mainWindow = getMainWindow();
            if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.send("show-notification", {
                    title: "Game Unavailable", body: "Please try again later", duration: 5000 // Optional
                });
            }
            throw new Error("Latest version information is missing.");
        }

        const gameUrl = latestVersionUrl;
        console.log(`Attempting to download from URL: ${gameUrl}`);

        const dl = await download(BrowserWindow.getFocusedWindow(), gameUrl, {
            directory: diabolicalLauncherPath, 
            onProgress: (progress) => {
                console.log(`Download progress for ${gameId}: ${progress.percent}%`);
                event.sender.send("download-progress", {
                    gameId: gameId, percentage: progress.percent,
                });
            },
        });

        console.log(`Download completed, starting extraction for ${gameId}`);
        await extractZip(dl.getSavePath(), gameId, event);

        console.log(`Writing version file for ${gameId}: ${latestVersion}`);
        fs.writeFileSync(versionFilePath(gameId), JSON.stringify({version: latestVersion}));

        getMainWindow().webContents.send("update-available", {
            gameId, updateAvailable: false,
        });

    } catch (error) {
        console.error("Download or Extraction error:", error);
        event.sender.send("download-error", gameId, error.message);
    }
}

module.exports = {
    downloadGame
};
