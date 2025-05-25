const fs = require('fs');
const path = require('path');
const { BrowserWindow } = require('electron');
const { download } = require('electron-dl');
const extract = require('extract-zip');
const { diabolicalLauncherPath, versionFilePath } = require('./settings');
const { getMainWindow } = require('./windowStore');
const { getLatestGameVersion } = require('./versionChecker');

async function extractZip(zipPath, gameId, event) {
  const extractPath = path.join(diabolicalLauncherPath, gameId);
  await extract(zipPath, { dir: extractPath });
  fs.unlinkSync(zipPath);
  event.sender.send('download-complete', gameId);
  return extractPath;
}

async function downloadGame(event, gameId) {
  try {
    console.log(`Starting download for: ${gameId}`);
    const { latestVersion, latestVersionUrl } = await getLatestGameVersion(gameId);
    if (!latestVersion || !latestVersionUrl) {
      const errorMsg = 'Game version information not found. Please try again later.';
      getMainWindow()?.webContents.send('show-notification', {
        title: 'Game Unavailable',
        body: errorMsg,
        duration: 5000,
      });
      event.sender.send('download-error', gameId, errorMsg);
      throw new Error(errorMsg);
    }

    // 1) fetch a presigned GET URL from our Worker
    const sessionId = await BrowserWindow.getFocusedWindow()?.webContents
      .executeJavaScript(`(() => {
        const m = document.cookie.match(/sessionID=([^;]+)/);
        return m ? m[1] : null;
      })()`);
    console.log('Using sessionID for presign:', sessionId);

    const presignResp = await fetch('https://cdn.diabolical.services/generateDownloadUrl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId && { sessionID: sessionId }),
      },
      body: JSON.stringify({
        key: `R2/${gameId}/Versions/Build-StandaloneWindows64-${latestVersion}.zip`,
      }),
    });
    if (!presignResp.ok) {
      const err = await presignResp.text();
      const errorMsg = `Failed to generate download URL: ${err}`;
      getMainWindow()?.webContents.send('show-notification', {
        title: 'Download Failed',
        body: errorMsg,
        duration: 5000,
      });
      event.sender.send('download-error', gameId, errorMsg);
      throw new Error(errorMsg);
    }
    const { url: downloadUrl } = await presignResp.json();
    console.log('Got presigned URL:', downloadUrl);

    // 2) download via electron-dl (no extra headers needed)
    const window = BrowserWindow.getFocusedWindow() || getMainWindow();
    const dl = await download(window, downloadUrl, {
      directory: diabolicalLauncherPath,
      onProgress: progress => {
        event.sender.send('download-progress', {
          gameId,
          percentage: progress.percent,
        });
      },
    });

    console.log('Download finished, extracting...');
    await extractZip(dl.getSavePath(), gameId, event);

    // 3) write version file
    fs.mkdirSync(path.join(diabolicalLauncherPath, gameId), { recursive: true });
    fs.writeFileSync(versionFilePath(gameId), JSON.stringify({ version: latestVersion }));

    getMainWindow()?.webContents.send('update-available', {
      gameId,
      updateAvailable: false,
    });
  } catch (err) {
    console.error('Download error:', err);
    // Only show notification if it hasn't been shown already
    if (
      !err.message.includes('Game version information not found') &&
      !err.message.includes('Failed to generate download URL')
    ) {
      getMainWindow()?.webContents.send('show-notification', {
        title: 'Download Failed',
        body: err.message || 'An unexpected error occurred during download',
        duration: 5000,
      });
    }
    event.sender.send('download-error', gameId, err.message);
    throw err;
  }
}

module.exports = { downloadGame, extractZip };
