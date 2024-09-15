const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let notificationWindow = null;

// Function to show the notification as a child window inside the main launcher
function showCustomNotification(mainWindow, title, body, gameId) {
  console.log(`Showing notification for ${gameId}: ${title}, ${body}`);

  // Create a new BrowserWindow for the notification (a small toaster window) as a child of the main window
  notificationWindow = new BrowserWindow({
    width: 320,
    height: 150,
    parent: mainWindow,  // Set this window as a child of the main window
    modal: false,        // Allow interaction with the main window
    frame: false,        // No window frame
    alwaysOnTop: true,   // Keep it above other elements in the launcher
    resizable: false,
    transparent: true,   // Transparent background for the window
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Position the notification window in the bottom-right corner of the main window
  positionNotification(mainWindow);

  // Load the HTML file into the notification window
  notificationWindow.loadFile(path.join(__dirname, 'notification.html'));

  // Send data to the notification window (title, body, and gameId)
  notificationWindow.webContents.on('did-finish-load', () => {
    notificationWindow.webContents.send('notification-data', { title, body, gameId });
  });

  // Auto close the notification after a timeout (optional)
  setTimeout(() => {
    if (notificationWindow) {
      notificationWindow.close();
      notificationWindow = null;
    }
  }, 15000); // Auto close after 15 seconds

  // Re-position the notification window when the main window is moved or resized
  mainWindow.on('move', () => positionNotification(mainWindow));
}

// Function to position the notification window relative to the main window
function positionNotification(mainWindow) {
  if (!notificationWindow) return;

  const mainWindowBounds = mainWindow.getBounds(); // Get the main window's dimensions and position
  notificationWindow.setPosition(
    mainWindowBounds.x + mainWindowBounds.width - 350, // 30px margin from the right edge
    mainWindowBounds.y + mainWindowBounds.height - 200 // 50px margin from the bottom edge
  );
}

// IPC listener to handle download start
ipcMain.on('start-download', (event, gameId) => {
  const eventObj = { sender: event.sender }; // Simulate the event object
  downloadGame(eventObj, gameId); // Trigger the game download
});

module.exports = {
  showCustomNotification,
};
