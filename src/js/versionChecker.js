const fetch = import('node-fetch');

async function getLatestGameVersion(gameId) {
    const fetch = (await import('node-fetch')).default; // Dynamic import of node-fetch
    const apiUrl = 'https://objectstorage.eu-frankfurt-1.oraclecloud.com/p/gusB9LXo4v8-qUja7OPfq1BSteoEnzVIrUprDXuBV5EznaV-IEIlE9uuikYnde4x/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/';
  
    try {
      console.log(`Checking for new version of game: ${gameId}`);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();
  
      const versions = data.objects
        .map(obj => obj.name)
        .filter(name => name.startsWith(`${gameId}/Versions/Build-StandaloneWindows64-`))
        .map(name => {
          const versionMatch = name.match(/Build-StandaloneWindows64-(\d+\.\d+\.\d+)\.zip$/);
          return versionMatch ? versionMatch[1] : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  
      const latestVersion = versions[0];
      const latestVersionUrl = `https://objectstorage.eu-frankfurt-1.oraclecloud.com/p/gusB9LXo4v8-qUja7OPfq1BSteoEnzVIrUprDXuBV5EznaV-IEIlE9uuikYnde4x/n/frks8kdvmjog/b/DiabolicalGamesStorage/o/${gameId}/Versions/Build-StandaloneWindows64-${latestVersion}.zip`;
  
      return { latestVersion, latestVersionUrl };
    } catch (error) {
      console.error(`Failed to fetch the latest game version for ${gameId}:`, error);
      throw error;
    }
  }
  
  module.exports = {
    getLatestGameVersion,
  };
  