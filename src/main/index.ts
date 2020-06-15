import { IpcChannel } from "@/IPC/IpcChannel";
import { SystemInfoChannel } from "@/IPC/SystemInfoChannel";
import { NodeRedResultChannel } from "@/IPC/NodeRedResultChannel";
import { create as createMenu } from '@/main/menu';
import NodeRedSettings from '@/main/node-red-settings';
// import * as pkg from '@root/package.json';
import { app, BrowserWindow, ipcMain, Menu, screen, dialog } from 'electron';
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
    httpServer: {
      port: 18880
    }
  },
  dirs: {
    base: isDev ? path.resolve(__dirname, '..', '..') : path.resolve(__dirname), // <base>/dist
    html: isDev ? path.resolve(__dirname, '..', '..', 'html') : path.resolve(__dirname, 'html'),
    renderers: isDev ? path.resolve(__dirname, '..', '..', 'html', 'renderers') : path.resolve(__dirname, 'html', 'renderers'),
    procedures: path.join(os.homedir(), '.visualcal', 'procedures'),
    visualCalUser: path.join(os.homedir(), '.visualcal')
  },
  assets: {
    basePath: path.resolve(__static),
    get: (name: string) => fs.readFileSync(path.resolve(__static, name))
  },
  windowManager: new WindowManager()
};

NodeRedSettings.functionGlobalContext.visualCal = global.visualCal;

// dialog.showErrorBox('html directory', global.visualCal.dirs.html);
// dialog.showErrorBox('renderers directory', global.visualCal.dirs.renderers);

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
      fullscreenable: true,
      autoHideMenuBar: false,
      webPreferences: {
        nodeIntegration: false,
        preload: path.join(global.visualCal.dirs.renderers, 'NodeRed.js')
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
      mainWindow.webContents.openDevTools();
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
