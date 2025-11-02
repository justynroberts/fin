import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
// Only needed for Windows Squirrel installer
if (process.platform === 'win32') {
  try {
    if (require('electron-squirrel-startup')) {
      app.quit();
    }
  } catch (e) {
    // electron-squirrel-startup not available, ignore on non-Windows
  }
}

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  // Get icon path based on platform
  const getIconPath = () => {
    if (process.platform === 'darwin') {
      return path.join(__dirname, '../../build/icon.icns');
    } else if (process.platform === 'win32') {
      return path.join(__dirname, '../../build/icon.ico');
    } else {
      return path.join(__dirname, '../../build/icons/512x512.png');
    }
  };

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Disable sandbox to allow speech recognition network access
      webSecurity: true,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
    show: false,
  });

  // Load the index.html of the app
  if (process.env.NODE_ENV === 'development') {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    console.log('[Main] 🔄 Loading from dev server:', devServerUrl);
    mainWindow.loadURL(devServerUrl);
  } else {
    console.log('[Main] 🔄 Loading from production build:', path.join(__dirname, '../renderer/index.html'));
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window immediately in development, or wait for ready-to-show in production
  if (process.env.NODE_ENV === 'development') {
    mainWindow.show();

    // Add hard reload shortcut (Cmd/Ctrl+Shift+R)
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if ((input.meta || input.control) && input.shift && input.key.toLowerCase() === 'r') {
        console.log('[Main] 🔥 HARD RELOAD - Clearing cache and reloading');
        mainWindow?.webContents.session.clearCache().then(() => {
          mainWindow?.webContents.reload();
        });
        event.preventDefault();
      }
    });
  } else {
    mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
    });
  }

  // Listen for did-fail-load event
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    try {
      console.error(`[Main] Failed to load: ${errorCode} - ${errorDescription}`);
    } catch (e) {
      // Ignore EPIPE errors when stdout is closed
    }
  });

  // Listen for console messages from renderer (only in development)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.on('console-message', (_event, level, message) => {
      try {
        // Only log errors and warnings to reduce noise
        if (level >= 1) {
          console.log(`[Renderer] ${message}`);
        }
      } catch (e) {
        // Ignore EPIPE errors when stdout is closed
      }
    });
  }

  // Handle permissions for media devices and speech recognition
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'microphone', 'audioCapture'];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Allow Google speech API connections
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://fonts.googleapis.com https://fonts.gstatic.com data: blob:"]
      }
    });
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Enable required Chromium features for speech recognition
app.commandLine.appendSwitch('enable-speech-input');
app.commandLine.appendSwitch('enable-web-bluetooth');

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // DEVELOPMENT: Clear all caches to ensure fresh code loads
  if (process.env.NODE_ENV === 'development') {
    const session = require('electron').session;
    console.log('[Main] 🔥 CLEARING ALL CACHES IN DEVELOPMENT MODE');
    await session.defaultSession.clearCache();
    await session.defaultSession.clearStorageData({
      storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
    });
    console.log('[Main] ✅ Cache cleared successfully');
  }

  // Initialize settings service
  const { settingsService } = await import('./settings-service');
  await settingsService.init();

  // Initialize AI service
  const { aiService } = await import('./ai-service');
  await aiService.init();

  // Initialize code execution service
  const { codeExecutionService } = await import('./code-execution-service');
  await codeExecutionService.init();

  createWindow();

  // On macOS, re-create window when dock icon is clicked and no windows open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle IPC messages
import { registerIpcHandlers } from './ipc-handlers';

ipcMain.handle('ping', () => 'pong');

// Register workspace and Git IPC handlers
registerIpcHandlers();

// Security: Filter navigation
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    // Allow only local navigation in development
    if (process.env.NODE_ENV === 'development') {
      if (parsedUrl.origin !== 'http://localhost:5173') {
        event.preventDefault();
      }
    } else {
      event.preventDefault();
    }
  });

  // Prevent new window creation
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});
