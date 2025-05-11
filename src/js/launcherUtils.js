const fs = require('fs');
const path = require('path');

const IGNORED_EXE = [
  // Unity
  'unitycrashhandler64.exe',
  'unitycrashhandler.exe',
  'unityplayer.exe',
  // Unreal
  'crashreportclient.exe',
  'crashreportclienteditor.exe',
  'ue4editor.exe',
  'ue4editor-cmd.exe',
  'ue4editor-win64-debug.exe',
  'ue4editor-win64-development.exe',
  'ue4editor-win64-shipping.exe',
  'ue4editor-win64-test.exe',
  'ue4game.exe',
  'ue4game-cmd.exe',
  'ue4game-win64-debug.exe',
  'ue4game-win64-development.exe',
  'ue4game-win64-shipping.exe',
  'ue4game-win64-test.exe',
  'unrealversionselector.exe',
  'unrealinsights.exe',
  'unrealeditor.exe',
  'unrealeditor-cmd.exe',
  'unrealeditor-win64-debug.exe',
  'unrealeditor-win64-development.exe',
  'unrealeditor-win64-shipping.exe',
  'unrealeditor-win64-test.exe',
  // Steam
  'steamerrorreporter.exe',
  'steamerrorreporter64.exe',
];

function getPreferredExecutable(gamePath, gameId) {
  const files = fs.readdirSync(gamePath);
  const exeFiles = files.filter(f => f.toLowerCase().endsWith('.exe'));
  if (exeFiles.length === 0) return null;
  // Prefer exe that matches gameId
  let preferred = exeFiles.find(f => f.toLowerCase().includes(gameId.toLowerCase()));
  if (!preferred) {
    // Fallback: skip known non-game exes
    preferred = exeFiles.find(f => !IGNORED_EXE.includes(f.toLowerCase()));
  }
  // If all are ignored, just pick the first
  const exeToRun = preferred || exeFiles[0];
  return path.join(gamePath, exeToRun);
}

function getAllUnityPackages(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        getAllUnityPackages(filePath, results);
      } else if (filePath.endsWith('.unitypackage')) {
        results.push({
          name: path.basename(filePath),
          path: filePath,
          size: stat.size,
          mtime: stat.mtimeMs,
        });
      }
    } catch (e) {
      // Ignore permission errors or broken symlinks
    }
  }
  return results;
}

module.exports = { getPreferredExecutable, getAllUnityPackages };
