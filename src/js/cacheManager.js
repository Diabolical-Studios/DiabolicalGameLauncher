const fs = require('fs');
const path = require('path');
const {diabolicalLauncherPath} = require('./settings');

const cachedGamesPath = path.join(diabolicalLauncherPath, 'cachedGames.json');

function cacheGamesLocally(games) {
    try {
        fs.writeFileSync(cachedGamesPath, JSON.stringify(games, null, 2));
        console.log('✅ Cached games written to disk.');
    } catch (err) {
        console.error('❌ Failed to cache games:', err);
    }
}

function readCachedGames() {
    try {
        if (fs.existsSync(cachedGamesPath)) {
            const data = fs.readFileSync(cachedGamesPath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('❌ Failed to read cached games:', err);
    }
    return [];
}

module.exports = {cacheGamesLocally, readCachedGames};
