// database.js
console.log("Loaded database.js!");
const https = require('https');
const axios = require("axios");
const { getMainWindow } = require("./windowManager");
require('dotenv').config();

function fetchGames() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'diabolical.studio',
            path: '/.netlify/functions/fetchGames',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, res => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('Network response was not ok: ' + res.statusCode));
            }

            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', error => {
            console.error('Failed to fetch games:', error);
            reject(error);
        });

        req.end();
    });
}

function pingDatabase(url) {
    axios
        .get(url)
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                console.log(`Website ${url} is up! Status Code: ${response.status}`);
                getMainWindow().webContents.send("db-status", "rgb(72, 216, 24)");
            } else {
                console.log(`Website ${url} returned status code ${response.status}`);
                getMainWindow().webContents.send("db-status", "red");
            }
        })
        .catch((error) => {
            console.error(`Error checking ${url}: ${error}`);
            getMainWindow().webContents.send("db-status", "red");
        });
}

module.exports = { pingDatabase, fetchGames };
