const { dialog, shell, app, BrowserWindow } = require('electron');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { download } = require('electron-dl');

function downloadUpdate(url, assetName, callback) {
    const savePath = path.join(app.getPath('temp'), assetName);
    const win = BrowserWindow.getFocusedWindow(); // Ensure this exists or manage differently if null

    download(win, url, {
        saveAs: false,
        directory: path.dirname(savePath),
        onProgress: progress => console.log(`Download progress: ${progress.percent * 100}%`)
    }).then(dl => {
        // Here dl is the DownloadItem from Electron's session module, which provides getSavePath()
        callback(null, dl.getSavePath());
    }).catch(err => {
        callback(err);
    });
}

function checkForUpdates(currentVersion) {
    fetchLatestRelease().then(release => {
        const latestVersion = release.tag_name;
        if (latestVersion !== currentVersion) {
            const asset = release.assets.find(asset => asset.name.endsWith('.exe')); // Adjust as needed
            if (asset) {
                promptForUpgrade(latestVersion, asset.browser_download_url, asset.name);
            } else {
                console.error('No valid assets found for download.');
            }
        }
    }).catch(console.error);
}

function fetchLatestRelease() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: '/repos/Diabolical-Studios/DiabolicalLauncher/releases/latest',
            method: 'GET',
            headers: { 'User-Agent': 'Node.js' }
        };

        const req = https.request(options, res => {
            let rawData = '';
            res.on('data', chunk => rawData += chunk);
            res.on('end', () => resolve(JSON.parse(rawData)));
        });

        req.on('error', reject);
        req.end();
    });
}

function promptForUpgrade(version, url, assetName) {
    let message = `Version ${version} is available. Do you want to download and install it now?`;
    dialog.showMessageBox({
        type: 'info',
        message: 'Update Available',
        detail: message,
        buttons: ['Yes', 'No']
    }).then(result => {
        if (result.response === 0) { // User chose 'Yes'
            downloadUpdate(url, assetName, (err, installerPath) => {
                if (err) {
                    dialog.showErrorBox('Update Error', `Failed to download the update: ${err.message}`);
                    return;
                }
                runInstaller(installerPath);
            });
        }
    });
}

function runInstaller(installerPath) {
    const { exec } = require('child_process');
    const updateScriptPath = path.join(app.getPath('temp'), 'update.bat');

    fs.writeFileSync(updateScriptPath, `
        @echo off
        :loop
        tasklist | find "${path.basename(process.execPath)}" > nul 2>&1
        if errorlevel 1 (
            start "" "${installerPath}"
            exit
        ) else (
            timeout /t 1
            goto loop
        )
    `, 'utf8');

    exec(`start cmd /c "${updateScriptPath}"`, (error) => {
        if (error) {
            console.error(`Failed to execute update script: ${error}`);
            return;
        }
        app.quit();
    });
}

module.exports = { checkForUpdates };
