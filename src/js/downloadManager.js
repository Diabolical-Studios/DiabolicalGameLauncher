const fs = require("fs");
const path = require("path");
const { BrowserWindow } = require("electron");
const { download } = require("electron-dl");
const extract = require("extract-zip");
const { diabolicalLauncherPath, versionFilePath } = require("./settings");
const { getMainWindow } = require("./windowManager");
const { getLatestGameVersion } = require('./versionChecker'); // Correct import


async function extractZip(zipPath, gameId, event) {
  const extractPath = path.join(diabolicalLauncherPath, gameId);
  try {
    await extract(zipPath, { dir: extractPath });
    fs.unlinkSync(zipPath);

    const executablePath = path.join(extractPath, "StandaloneWindows64.exe");

    // Debugging: log the executable path to the console
    console.log(`Executable path after extraction: ${executablePath}`);

    event.sender.send("download-complete", gameId, executablePath);
    return executablePath;
  } catch (error) {
    console.error("Extraction error:", error);
    event.sender.send("download-error", gameId, "Extraction failed");
  }
}

async function downloadGame(event, gameId, platform = "StandaloneWindows64") {
  try {
    const { latestVersion, latestVersionUrl } = await getLatestGameVersion(
      gameId
    );

    if (!latestVersion || !latestVersionUrl) {
      throw new Error("Latest version information is missing.");
    }

    const gameUrl = latestVersionUrl;

    const dl = await download(BrowserWindow.getFocusedWindow(), gameUrl, {
      directory: diabolicalLauncherPath,
      onProgress: (progress) => {
        const progressData = {
          gameId: gameId,
          percentage: progress.percent,
        };
        console.log("Sending download progress:", progressData);
        event.sender.send("download-progress", progressData);
      },
    });

    await extractZip(dl.getSavePath(), gameId, event);

    fs.writeFileSync(
      versionFilePath(gameId),
      JSON.stringify({ version: latestVersion })
    );

    getMainWindow().webContents.send("update-available", {
      gameId,
      updateAvailable: false,
    });
    
  } catch (error) {
    console.error("Download or Extraction error:", error);
    event.sender.send("download-error", gameId, error.message);
  }
}

module.exports = {
  downloadGame
};
