'use strict';

// Electron main process. The renderer has no direct Node.js access.
const { app, BrowserWindow, session } = require('electron');
const path = require('node:path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 360,
    minHeight: 420,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#f2f5fb',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  // This app does not need pop-up windows or page navigation.
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.loadFile(path.join(__dirname, 'index.html')).catch((error) => {
    console.error('Could not load the Student Task Manager window:', error);
  });

  return mainWindow;
}

app.whenReady().then(() => {
  // The application does not request browser permissions; deny them by default.
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch((error) => {
  console.error('Could not start the Student Task Manager:', error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
