const { dialog, shell, app } = require('electron');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { download } = require('electron-dl');
const { BrowserWindow } = require('electron');


// Download the update file
function downloadUpdate(url, assetName) {
    const savePath = path.join(app.getPath('temp'), assetName);
    const win = BrowserWindow.getFocusedWindow();

    return download(win, url, {
        saveAs: false,
        directory: path.dirname(savePath)
    }).then(dl => dl.getSavePath());
}

// Check and download update if available
function checkForUpdates(currentVersion) {
    fetchLatestRelease().then(release => {
        const latestVersion = release.tag_name;
        if (latestVersion !== currentVersion) {
            console.log('Update available:', latestVersion);
            const asset = release.assets.find(asset => asset.name.endsWith('.exe')); // Change this depending on your asset names
            if (asset) {
                promptForUpgrade(latestVersion, asset.browser_download_url, asset.name);
            } else {
                console.error('No valid assets found for download.');
            }
        } else {
            console.log('No updates available.');
        }
    }).catch(error => {
        console.error('Error checking for updates:', error);
    });
}

// Fetch the latest release information from GitHub
function fetchLatestRelease() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: '/repos/Diabolical-Studios/DiabolicalLauncher/releases/latest',
            method: 'GET',
            headers: { 'User-Agent': 'Node.js' }
        };

        const req = https.request(options, res => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch data, status code: ${res.statusCode}`));
            }
            let rawData = '';
            res.on('data', chunk => rawData += chunk);
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resolve(parsedData);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

function promptForUpgrade(version, url, assetName) {
    let message = `Version ${version} is available. Do you want to download and install it now?`;
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: 'A new version of Diabolical Launcher is available.',
        detail: message,
        buttons: ['Yes', 'No']
    }).then(result => {
        if (result.response === 0) { // The user clicked 'Yes'
            downloadUpdate(url, assetName).then(installerPath => {
                runInstaller(installerPath);
            }).catch(err => {
                console.error('Failed to download the update:', err);
                dialog.showErrorBox('Update Error', 'Failed to download the update. Please try again later.');
            });
        }
    });
}


// Run the downloaded installer
function runInstaller(installerPath) {
    const { exec } = require('child_process');
    exec(installerPath, (error) => {
        if (error) {
            console.error(`Failed to execute installer: ${error}`);
            return;
        }
        app.quit();
    });
}

module.exports = { checkForUpdates };
