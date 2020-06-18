import 'module-alias/register';
import { app, BrowserWindow, ipcMain, Menu, screen } from 'electron';
import express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as RED from "node-red";
import * as path from 'path';
import { IpcChannel } from "./IPC/IpcChannel";
import { LoginChannel } from './IPC/LoginChannel';
import { NodeRedResultChannel } from "./IPC/NodeRedResultChannel";
import { SystemInfoChannel } from "./IPC/SystemInfoChannel";
import { LoadingWindowConfig, MainWindowConfig } from './managers/WindowConfigs';
import { create as createMenu } from './menu';
import NodeRedSettings from './node-red-settings';
import './InitGlobal';

const urlStart = 'red';

let mainWindow: BrowserWindow | null = null;
const nodeRedApp = express();
const httpServer = http.createServer(nodeRedApp);
const nodeRed = RED as RED.Red;

function init(ipcChannels: IpcChannel<any>[]) {
  registerIpcChannels(ipcChannels);
  createHomeDirectory();
  app.on('ready', async () => await onAppReady());
  app.on('window-all-closed', onWindowAllClosed);
  app.on('activate', onActive);
  nodeRed.init(httpServer, NodeRedSettings);
  nodeRedApp.use(NodeRedSettings.httpAdminRoot, nodeRed.httpAdmin);
  nodeRedApp.use(NodeRedSettings.httpNodeRoot, nodeRed.httpNode);
}

function createHomeDirectory() {
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
      await createMainWindow();
    }, duration);
  });
  await loadingScreen.loadFile(path.join(global.visualCal.dirs.html, 'loading.html'));
}

async function createMainWindow() {
  const cursorScreenPoint = screen.getCursorScreenPoint();
  const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
  mainWindow = global.visualCal.windowManager.create(MainWindowConfig());
  mainWindow.setBounds(nearestScreenToCursor.workArea);
  const menu = Menu.buildFromTemplate(createMenu());
  Menu.setApplicationMenu(menu);

  if (process.platform !== 'darwin') mainWindow.setAutoHideMenuBar(true);
  mainWindow.once('close', (e) => {
    // Required for node-red if it's in a modified state and changes haven't been deployed
    e.preventDefault();
    global.visualCal.windowManager.closeAll();
    mainWindow = null;
    app.quit();
    app.exit();
  });
  mainWindow.webContents.once('did-finish-load', async () => {
    if (!mainWindow) return
    mainWindow.title = 'VisualCal - Logic Editor';
    mainWindow.show();
    await global.visualCal.windowManager.ShowLogin();
  });
  await mainWindow.loadURL(`http://localhost:${global.visualCal.config.httpServer.port}/${urlStart}`);
}

init([
  new SystemInfoChannel(),
  new NodeRedResultChannel(),
  new LoginChannel()
]);
