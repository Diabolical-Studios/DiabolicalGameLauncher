// database.js
console.log("Loaded database.js!");
const https = require('https');
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

module.exports = { fetchGames };
