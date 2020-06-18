import 'module-alias/register';
import { app, BrowserWindow, ipcMain, Menu, ipcRenderer } from 'electron';
import express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as RED from "node-red";
import * as path from 'path';
import { IpcChannel } from "./IPC/IpcChannel";
import { NodeRedResultChannel } from "./IPC/NodeRedResultChannel";
import { SystemInfoChannel } from "./IPC/SystemInfoChannel";
import { LoadingWindowConfig, MainWindowConfig } from './managers/WindowConfigs';
import { create as createMenu } from './menu';
import NodeRedSettings from './node-red-settings';
import * as utils from './utils';
import './InitGlobal';
import { login } from './security';

const urlStart = 'red';

let mainWindow: BrowserWindow | null = null;
const nodeRedApp = express();
const httpServer = http.createServer(nodeRedApp);
const nodeRed = RED as RED.Red;

function init(ipcChannels: IpcChannel<any>[]) {
  registerIpcChannels(ipcChannels);
  ensureUserHomeDir();
  app.on('ready', async () => await onAppReady());
  app.on('window-all-closed', onWindowAllClosed);
  app.on('activate', onActive);
  nodeRed.init(httpServer, NodeRedSettings);
  nodeRedApp.use(NodeRedSettings.httpAdminRoot, nodeRed.httpAdmin);
  nodeRedApp.use(NodeRedSettings.httpNodeRoot, nodeRed.httpNode);
}

function ensureUserHomeDir() {
  if (!fs.existsSync(global.visualCal.dirs.visualCalUser)) fs.mkdirSync(global.visualCal.dirs.visualCalUser);
}

function registerIpcChannels(ipcChannels: IpcChannel<string>[]) {
  ipcChannels.forEach(channel => ipcMain.on(channel.getName(), (event, request) => channel.handle(event, request)));
}

async function onAppReady() {
  httpServer.listen(global.visualCal.config.httpServer.port, 'localhost', async () => {
    await nodeRed.start();
  });
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

async function createLoadingWindow(duration: number = 5000) {
  let loadingScreen = global.visualCal.windowManager.create(LoadingWindowConfig());
  loadingScreen.once('closed', () => { loadingScreen = null; });
  loadingScreen.webContents.once('did-finish-load', () => {
    if (loadingScreen) loadingScreen.show();
    setTimeout(async () => {
      if (loadingScreen) loadingScreen.close();
      await createLoginWindow();
    }, duration);
  });
  await loadingScreen.loadFile(path.join(global.visualCal.dirs.html, 'loading.html'));
}

async function createLoginWindow() {
  let loginWindow = await global.visualCal.windowManager.ShowLogin();
  ipcMain.on('login', async (event, args: LoginCredentials) => {
    if (!args) return event.sender.send('login-error', 'Missing credentials');
    const credentials = args;
    const result = login(credentials);
    if (result) {
      ipcMain.removeHandler('login');
      loginWindow.close();
      loginWindow = null;
      await createMainWindow();
    } else {
      event.reply('login-error', 'Incorrect login credentials');
    }
  });
}

async function createMainWindow() {
  mainWindow = global.visualCal.windowManager.create(MainWindowConfig());
  utils.centerWindowOnNearestCurorScreen(mainWindow);
  const menu = Menu.buildFromTemplate(createMenu());
  Menu.setApplicationMenu(menu);

  if (process.platform !== 'darwin') mainWindow.setAutoHideMenuBar(true);
  mainWindow.once('close', (e) => {
    e.preventDefault(); // Required for node-red if it's in a modified state and changes haven't been deployed
    global.visualCal.windowManager.closeAll();
    mainWindow = null;
    app.quit();
    app.exit();
  });
  mainWindow.webContents.once('did-finish-load', async () => {
    if (!mainWindow) return
    mainWindow.title = 'VisualCal - Logic Editor';
    mainWindow.show();
  });
  await mainWindow.loadURL(`http://localhost:${global.visualCal.config.httpServer.port}/${urlStart}`);
}

init([
  new SystemInfoChannel(),
  new NodeRedResultChannel()
]);
