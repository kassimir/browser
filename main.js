const { app, BrowserWindow, ipcMain, webContents } = require('electron');
const path = require('path');

let mainWindow;
let closedTabs = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      webSecurity: false
    },
    titleBarStyle: 'default',
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for tab management
ipcMain.handle('create-new-tab', () => {
  return { id: Date.now(), url: 'speed-dial.html', title: 'Speed Dial' };
});

ipcMain.handle('create-new-window', () => {
  const newWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      webSecurity: false
    }
  });
  newWindow.loadFile('index.html');
  return { success: true };
});

ipcMain.handle('close-tab', (event, tabId) => {
  // Store closed tab info for reopening
  closedTabs.push({ id: tabId, timestamp: Date.now() });
  return { success: true };
});

ipcMain.handle('reopen-tab', () => {
  if (closedTabs.length > 0) {
    const tabToReopen = closedTabs.pop();
    return { success: true, tab: tabToReopen };
  }
  return { success: false };
});

ipcMain.handle('get-closed-tabs', () => {
  return closedTabs;
});
