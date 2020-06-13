import { IpcChannel } from "@/IPC/IpcChannel";
import { SystemInfoChannel } from "@/IPC/SystemInfoChannel";
import { NodeRedResultChannel } from "@/IPC/NodeRedResultChannel";
import { create as createMenu } from '@/main/menu';
import NodeRedSettings from '@/node-red-settings';
// import * as pkg from '@root/package.json';
import { app, BrowserWindow, ipcMain, Menu, screen, dialog, nativeImage } from 'electron';
import express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as RED from "node-red";
import * as path from 'path';
import { WindowManager } from './managers/WindowManager';
import isDev from 'electron-is-dev';
import { create as createLogger } from './logging/CreateLogger';
import * as os from 'os';

global.visualCal = {
  logger: createLogger(),
  isMac: process.platform === 'darwin',
  isDev: isDev,
  config: {
    appIcon: path.resolve(__static, 'app-icon.png'),
    httpServer: {
      port: 18880
    }
  },
  dirs: {
    base: path.join(__dirname, '..', '..'), // <base>/dist
    html: path.resolve(__static),
    procedures: path.join(os.homedir(), '.visualcal', 'procedures'),
    visualCalUser: path.join(os.homedir(), '.visualcal')
  },
  assets: {
    basePath: path.resolve(__static),
    get: (name: string) => fs.readFileSync(path.resolve(__static, name))
  },
  windowManager: new WindowManager()
};

try {

  const urlStart = 'red';
  // const pkgJsonOptions = pkg.NRelectron;

  let mainWindow: BrowserWindow | null = null;
  // private conWindow: BrowserWindow | null = null;
  const nodeRedApp = express();
  const httpServer = http.createServer(nodeRedApp);
  const nodeRed = RED as RED.Red;
  // private log: string[] = [];

  function init(ipcChannels: IpcChannel<string>[]) {
    configureApp();
    registerIpcChannels(ipcChannels);
    createHomeDirectory();
    app.on('ready', async () => await onAppReady());
    app.on('window-all-closed', onWindowAllClosed);
    app.on('activate', onActive);
    nodeRed.init(httpServer, NodeRedSettings);
    nodeRedApp.use(NodeRedSettings.httpAdminRoot, nodeRed.httpAdmin);
    nodeRedApp.use(NodeRedSettings.httpNodeRoot, nodeRed.httpNode);
  }

  async function onAppReady() {
    const gjsEditorWindow = global.visualCal.windowManager.create({
      id: 'grapesjs-editor',
      config: {
        title: 'GrapesJS Editor',
        webPreferences: {
          nodeIntegration: true
        }
      },
      autoRemove: true
    });
    await gjsEditorWindow.loadFile(path.join(global.visualCal.dirs.html, 'GrapesJS.html'));
    await createLoadingWindow();
  }

  function onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  async function onActive() {
    if (!mainWindow) {
      await createMainWindow();
    }
  }

  function registerIpcChannels(ipcChannels: IpcChannel<string>[]) {
    ipcChannels.forEach(channel => ipcMain.on(channel.getName(), (event, request) => channel.handle(event, request)));
  }

  function configureApp() {
    const isFirstInstance = app.requestSingleInstanceLock();
    if (!isFirstInstance) app.quit();
    if (app.dock) app.dock.setIcon(nativeImage.createFromPath(global.visualCal.config.appIcon));
    if (app.setUserTasks) app.setUserTasks([
      {
        program: process.execPath,
        arguments: '',
        iconPath: global.visualCal.config.appIcon,
        iconIndex: 0,
        title: 'VisualCal',
        description: 'IndySoft VisualCal'
      }
    ]);
  }

  function createHomeDirectory() {
    if (!fs.existsSync(global.visualCal.dirs.visualCalUser)) fs.mkdirSync(global.visualCal.dirs.visualCalUser);
  }

  async function createLoadingWindow(duration: number = 5000) {
    const cursorScreenPoint = screen.getCursorScreenPoint();
    const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
    let loadingScreen: BrowserWindow | null = new BrowserWindow({
      height: 200,
      width: 400,
      x: nearestScreenToCursor.workArea.x - 200 + nearestScreenToCursor.bounds.width / 2,
      y: nearestScreenToCursor.workArea.y - 200 + nearestScreenToCursor.bounds.height / 2,
      icon: nativeImage.createFromPath(global.visualCal.config.appIcon),
      title: 'VisualCal',
      frame: false,
      transparent: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    loadingScreen.on('closed', () => loadingScreen = null);
    loadingScreen.webContents.on('did-finish-load', () => {
      if (loadingScreen) loadingScreen.show();
      setTimeout(() => {
        if (loadingScreen) loadingScreen.close();
        httpServer.listen(global.visualCal.config.httpServer.port, 'localhost', async () => {
          await nodeRed.start();
          await createMainWindow();
        });
      }, duration);
    });
    await loadingScreen.loadFile(path.join(global.visualCal.dirs.html, 'loading.html'));
  }

  async function createMainWindow() {
    const cursorScreenPoint = screen.getCursorScreenPoint();
    const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
    mainWindow = new BrowserWindow({
      title: "VisualCal",
      width: 1024,
      height: 768,
      icon: nativeImage.createFromPath(global.visualCal.config.appIcon),
      fullscreenable: true,
      autoHideMenuBar: false,
      webPreferences: {
        nodeIntegration: false,
        preload: path.join(__dirname, '..', 'apps', 'NodeRed.js')
      }
    });
    global.visualCal.windowManager.add({
      id: 'main',
      window: mainWindow,
      isMain: true
    });
    mainWindow.setBounds(nearestScreenToCursor.workArea);
    const menu = Menu.buildFromTemplate(createMenu());
    Menu.setApplicationMenu(menu);

    if (process.platform !== 'darwin') mainWindow.setAutoHideMenuBar(true);
    mainWindow.webContents.on('did-finish-load', () => {
      if (!mainWindow) return
      mainWindow.show();
    });
    mainWindow.on('close', (e) => {
      // Required for node-red if it's in a modified state and changes haven't been deployed
      e.preventDefault();
      if (mainWindow) {
        global.visualCal.windowManager.remove('main');
        mainWindow.destroy();
      }
      mainWindow = null;
      global.visualCal.windowManager.closeAll();
      app.quit();
    });
    await mainWindow.loadURL(`http://localhost:${global.visualCal.config.httpServer.port}/${urlStart}`);
  }

  // private createConsoleWindow() {

  // }

  init([
    new SystemInfoChannel(),
    new NodeRedResultChannel()
  ]);

} catch (error) {
  dialog.showErrorBox('Oops!', error.message);
}
