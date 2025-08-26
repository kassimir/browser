const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  createNewTab: () => ipcRenderer.invoke('create-new-tab'),
  createNewWindow: () => ipcRenderer.invoke('create-new-window'),
  closeTab: (tabId) => ipcRenderer.invoke('close-tab', tabId),
  reopenTab: () => ipcRenderer.invoke('reopen-tab'),
  getClosedTabs: () => ipcRenderer.invoke('get-closed-tabs'),
  
  // Webview communication
  onWebviewLoad: (callback) => ipcRenderer.on('webview-load', callback),
  onWebviewTitleChange: (callback) => ipcRenderer.on('webview-title-change', callback),
  onWebviewFaviconChange: (callback) => ipcRenderer.on('webview-favicon-change', callback),
  
  // Capture webview content
  captureWebview: () => ipcRenderer.invoke('capture-webview'),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
