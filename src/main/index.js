const { app, BrowserWindow, ipcMain, dialog, protocol, net } = require('electron')
const path = require('path')
const fs = require('fs')
const { pathToFileURL } = require('url')

app.commandLine.appendSwitch('no-sandbox')

let mainWindow = null

function getHighlightsFile() {
  return path.join(app.getPath('userData'), 'highlights.json')
}

function readHighlightsStore() {
  try {
    const file = getHighlightsFile()
    if (!fs.existsSync(file)) return {}
    const raw = fs.readFileSync(file, 'utf-8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (e) {
    return {}
  }
}

function writeHighlightsStore(store) {
  try {
    const file = getHighlightsFile()
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify(store, null, 2), 'utf-8')
    return true
  } catch (e) {
    return false
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f12',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  protocol.handle('local-files', (request) => {
    const rawPath = request.url.replace('local-files://', '')
    const filePath = decodeURIComponent(rawPath)
    const fileUrl = pathToFileURL(filePath).href
    return net.fetch(fileUrl)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  return result
})

ipcMain.handle('fs:scanFolder', async (event, folderPath) => {
  try {
    const files = []

    function scanDir(dirPath, basePath = dirPath) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)

        if (entry.isDirectory()) {
          scanDir(fullPath, basePath)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (ext === '.md' || ext === '.txt') {
            const relativePath = path.relative(basePath, fullPath)
            const depth = relativePath.split(path.sep).length - 1
            files.push({
              name: path.basename(entry.name, ext),
              path: fullPath,
              relativePath,
              extension: ext,
              depth
            })
          }
        }
      }
    }

    scanDir(folderPath)

    files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))

    return { files }
  } catch (error) {
    return { error: error.message }
  }
})

ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { content }
  } catch (error) {
    return { error: error.message }
  }
})

ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close()
})

ipcMain.handle('highlights:load', (_event, filePath) => {
  if (typeof filePath !== 'string' || !filePath) return []
  const store = readHighlightsStore()
  return Array.isArray(store[filePath]) ? store[filePath] : []
})

ipcMain.handle('highlights:save', (_event, filePath, highlights) => {
  if (typeof filePath !== 'string' || !filePath) {
    return { ok: false, error: 'invalid filePath' }
  }
  const store = readHighlightsStore()
  if (!Array.isArray(highlights) || highlights.length === 0) {
    delete store[filePath]
  } else {
    store[filePath] = highlights
  }
  const ok = writeHighlightsStore(store)
  return { ok }
})