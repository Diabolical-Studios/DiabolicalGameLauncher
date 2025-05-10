let mainWindow = null;

function setMainWindow(win) {
  mainWindow = win;
}

function getMainWindow() {
  return mainWindow;
}

function showMessage(message) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('updateMessage', message);
  }
}

module.exports = { setMainWindow, getMainWindow, showMessage };
