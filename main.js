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

// Capture webview content for tab previews
ipcMain.handle('capture-webview', async (event) => {
  try {
    // Get the main window's webContents
    const mainWebContents = mainWindow.webContents;
    
    // Execute JavaScript in the renderer process to capture the webview
    const result = await mainWebContents.executeJavaScript(`
      (() => {
        try {
          const webview = document.querySelector('webview');
          if (!webview) {
            return { success: false, error: 'Webview not found' };
          }
          
          // Check if the webview has a src and is not the speed dial
          if (!webview.src || webview.src === 'speed-dial.html') {
            return { success: false, error: 'Invalid webview source' };
          }
          
          // Try to capture the webview content directly
          if (webview.capturePage && typeof webview.capturePage === 'function') {
            return { success: true, webviewAvailable: true };
          } else {
            return { success: false, error: 'capturePage method not available' };
          }
        } catch (error) {
          return { success: false, error: error.message };
        }
      })();
    `);
    
    if (result.success && result.webviewAvailable) {
      // The webview is available in the renderer, let it handle the capture
      return { success: true, rendererCapture: true };
    } else {
      return { success: false, error: result.error || 'Webview capture not available' };
    }
  } catch (error) {
    console.error('Error checking webview:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-closed-tabs', () => {
  return closedTabs;
});
