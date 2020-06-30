import 'module-alias/register';
import { app, ipcMain } from 'electron';
import express from 'express';
import * as http from 'http';
import { IpcChannel } from "./IPC/IpcChannel";
import { NodeRedResultChannel } from "./IPC/NodeRedResultChannel";
import { SystemInfoChannel } from "./IPC/SystemInfoChannel";
import { init as initMainMenu } from './menu';
import NodeRedSettings from './node-red-settings';
import * as UserHomeUtils from './utils/HomeDir';
import { isLoggedIn, listenForLogin } from './security';
import history from 'connect-history-api-fallback';
import path from 'path';
import { VisualCalLogicServerFileSystem } from './node-red/storage/index';
import { ProcedureManager } from './managers/ProcedureManager';
import { init as nodeRedUtilsInit } from './node-red/utils';
import './InitGlobal'; // TODO: Does it matter where this is located in the order of imports?

try {

  const nodeRedApp = express();
  const httpServer = http.createServer(nodeRedApp);

  function init(ipcChannels: IpcChannel<any>[]) {
    UserHomeUtils.ensureExists();
    NodeRedSettings.userDir = path.join(global.visualCal.dirs.visualCalUser, 'logic'),
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

    if (!global.visualCal.isDev) {
      // Enable history for Vue router
      nodeRedApp.use(history({
        index: 'index.html'
      }));
      nodeRedApp.use('/', express.static(global.visualCal.dirs.html.vue));
    };
  }

  function registerIpcChannels(ipcChannels: IpcChannel<string>[]) {
    ipcChannels.forEach(channel => ipcMain.on(channel.getName(), (event, request) => channel.handle(event, request)));
  }

  async function onAppReady() {
    (await import('vue-devtools')).install();
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
    if (isLoggedIn() && global.visualCal.windowManager.mainWindow) {
      global.visualCal.windowManager.mainWindow.show();
      return;
    }
    if (!isLoggedIn()) {
      await createLoginWindow();
      return;
    }
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

} catch (err) {
  console.error(err);
}
