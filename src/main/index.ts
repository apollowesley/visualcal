import { app, ipcMain } from 'electron';
import express from 'express';
import * as http from 'http';
import path from 'path';
import { init as initGlobal } from './InitGlobal';
import { IpcChannel } from "./IPC/IpcChannel";
import { NodeRedResultChannel } from "./IPC/NodeRedResultChannel";
import { SystemInfoChannel } from "./IPC/SystemInfoChannel";
import { ProcedureManager } from './managers/ProcedureManager';
import { init as initMainMenu } from './menu';
import NodeRedSettings from './node-red-settings';
import { VisualCalLogicServerFileSystem } from './node-red/storage/index';
import { init as nodeRedUtilsInit } from './node-red/utils';
import { listenForLogin } from './security';
import { FileManager } from '../common/managers/FileManager';

const nodeRedApp = express();
const httpServer = http.createServer(nodeRedApp);

async function init(ipcChannels: IpcChannel<any>[]) {
  const appBaseDirPath: string = path.resolve(__dirname, '..', '..'); // <base>/dist
  const userHomeDataDirPath: string = path.join(app.getPath('documents'), 'IndySoft', 'VisualCal');
  initGlobal(appBaseDirPath, userHomeDataDirPath);
  const fileManager = new FileManager(appBaseDirPath, userHomeDataDirPath);
  await fileManager.ensureInitizilied();
  NodeRedSettings.userDir = path.join(global.visualCal.dirs.userHomeData.base, 'logic');
  NodeRedSettings.storageModule = VisualCalLogicServerFileSystem;
  NodeRedSettings.driversRoot = global.visualCal.dirs.drivers.base;
  nodeRedUtilsInit();
  initMainMenu();
  registerIpcChannels(ipcChannels);
  app.on('ready', async () => await onAppReady());
  app.on('window-all-closed', onWindowAllClosed);
  app.on('activate', onActive);
  global.visualCal.nodeRed.app.init(httpServer, NodeRedSettings);
  nodeRedApp.use(NodeRedSettings.httpAdminRoot, global.visualCal.nodeRed.app.httpAdmin);
  nodeRedApp.use(NodeRedSettings.httpNodeRoot, global.visualCal.nodeRed.app.httpNode);
  nodeRedApp.use('/nodes-public', express.static(global.visualCal.dirs.html.js)); // Some node-red nodes need external JS files, like indysoft-scalar-result needs quantities.js
}

function registerIpcChannels(ipcChannels: IpcChannel<string>[]) {
  ipcChannels.forEach(channel => ipcMain.on(channel.getName(), (event, request) => channel.handle(event, request)));
}

async function onAppReady() {
  httpServer.listen(global.visualCal.config.httpServer.port, 'localhost', async () => {
    try {
      await global.visualCal.nodeRed.app.start();
      await ProcedureManager.loadActive();
    } catch (error) {
      console.error(error);
    }
  });
  await createLoadingWindow();
}

function onWindowAllClosed() {
  app.exit();
}

async function onActive() {
  await global.visualCal.windowManager.ShowMain();
}

async function createLoadingWindow() {
  const onLoadingWindowClosed = async () => {
    if (global.visualCal.isDev) {
      await global.visualCal.windowManager.ShowMain();
    } else {
      await global.visualCal.windowManager.ShowMain();
      // TODO: Disable for demo on 30-JUN-2020
      // await createLoginWindow();
    }
  };
  await global.visualCal.windowManager.ShowLoading(onLoadingWindowClosed, 5000);
}

async function createLoginWindow() {
  listenForLogin();
  await global.visualCal.windowManager.ShowLogin();
}

init([
  new SystemInfoChannel(),
  new NodeRedResultChannel()
]);
