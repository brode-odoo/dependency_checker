const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let win;
let timerWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    autoHideMenuBar: true,
    title: "Dep Analyzer",
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, './preload.cjs')
    }
  });

  // Use this for production builds
  win.loadFile(path.join(__dirname, '../dist/index.html'));

  // Uncomment this section of code to use for development.
  // Run 'npm run start' to start both the Svelte server and the
  // election application.
  // const devServerUrl = 'http://localhost:5173';

  // const loadWithRetry = () => {
  //   win.loadURL(devServerUrl).catch(() => {
  //     // Catching the error here prevents the app from crashing on the first fail
  //   });
  // };

  // win.webContents.on('did-fail-load', () => {
  //   console.log("Server not ready, retrying in 1s...");
  //   setTimeout(loadWithRetry, 1000);
  // });

  // loadWithRetry();

  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('window-minimize', () => {
  if (BrowserWindow.getFocusedWindow()) {
    BrowserWindow.getFocusedWindow().minimize();
  }
});

ipcMain.on('app-close', () => {
  BrowserWindow.getAllWindows().forEach(win => win.close());
  app.quit();
  if (process.platform === 'win32') {
    exec('taskkill /f /im node.exe'); 
  } else {
    exec('pkill -f vite');
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
