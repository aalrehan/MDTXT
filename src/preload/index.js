const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  chooseFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  scanFolder: (folderPath) => ipcRenderer.invoke('fs:scanFolder', folderPath),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  loadHighlights: (filePath) => ipcRenderer.invoke('highlights:load', filePath),
  saveHighlights: (filePath, highlights) => ipcRenderer.invoke('highlights:save', filePath, highlights)
})