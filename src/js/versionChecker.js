const cacheManager = require('./cacheManager');

async function getLatestGameVersion(gameId) {
    try {
        // Get the cached games data
        const cachedGames = cacheManager.readCachedGames();
        const game = cachedGames.find((g) => g.game_id === gameId);

        if (!game || !game.version) {
            throw new Error(`No version information found for game ${gameId}`);
        }

        const latestVersion = game.version;
        console.log(`Using cached version for ${gameId}: ${latestVersion}`);

        // Construct the R2 URL directly
        const latestVersionUrl = `https://diabolical.services/R2/${gameId}/Versions/Build-StandaloneWindows64-${latestVersion}.zip`;
        console.log(`Constructed download URL: ${latestVersionUrl}`);

        return {latestVersion, latestVersionUrl};
    } catch (error) {
        console.error(`Failed to get game version for ${gameId}:`, error);
        throw error;
    }
}

module.exports = {
    getLatestGameVersion,
};
