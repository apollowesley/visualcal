import 'module-alias/register';
import { app, BrowserWindow, ipcMain } from 'electron';
import express from 'express';
import * as http from 'http';
import * as RED from "node-red";
import { IpcChannel } from "./IPC/IpcChannel";
import { NodeRedResultChannel } from "./IPC/NodeRedResultChannel";
import { SystemInfoChannel } from "./IPC/SystemInfoChannel";
import { init as initMainMenu } from './menu';
import NodeRedSettings from './node-red-settings';
import * as UserHomeUtils from './utils/HomeDir';
import { login, isLoggedIn } from './security';
import history from 'connect-history-api-fallback';
import { init as initIpcManager } from './managers/IPCManager';
import type { NodeRed } from '../types/logic-server';
import './InitGlobal'; // TODO: Does it matter where this is located in the order of imports?

try {

  const nodeRedApp = express();
  const httpServer = http.createServer(nodeRedApp);
  const nodeRed = RED as NodeRed;

  function init(ipcChannels: IpcChannel<any>[]) {
    initIpcManager();
    registerIpcChannels(ipcChannels);
    app.on('ready', async () => await onAppReady());
    app.on('window-all-closed', onWindowAllClosed);
    app.on('activate', onActive);
    nodeRed.init(httpServer, NodeRedSettings);
    nodeRedApp.use(NodeRedSettings.httpAdminRoot, nodeRed.httpAdmin);
    nodeRedApp.use(NodeRedSettings.httpNodeRoot, nodeRed.httpNode);
    nodeRedApp.use('/nodes-public', express.static(global.visualCal.dirs.html.js)); // Some node-red nodes need external JS files, like indysoft-scalar-result needs quantities.js
    nodeRedApp.use('/renderers/node-browser', express.static(global.visualCal.dirs.renderers.nodeBrowser)); // Some node-red nodes need browser-utils in renderers folder

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
    if (global.visualCal.isDev) (await import('vue-devtools')).install();
    await UserHomeUtils.ensureExists();
    httpServer.listen(global.visualCal.config.httpServer.port, 'localhost', async () => {
      try {
        await nodeRed.start();
      } catch (error) {
        console.error(error);
      }
    });
    await createLoadingWindow();
  }

  function onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
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
    const onLoadingWindowClosed = async () => await createLoginWindow();
    await global.visualCal.windowManager.ShowLoading(onLoadingWindowClosed, 5000);
  }

  async function createLoginWindow() {
    const loginWindow: BrowserWindow = await global.visualCal.windowManager.ShowLogin();
    ipcMain.on('login', async (event, args: LoginCredentials) => {
      if (!args) return event.sender.send('login-error', 'Missing credentials');
      const credentials = args;
      const result = login(credentials);
      if (result) {
        ipcMain.removeHandler('login');
        initMainMenu();
        await global.visualCal.windowManager.ShowMain();
        if (loginWindow) {
          loginWindow.close();
        }
        global.visualCal.user = {
          email: credentials.username
        }
      } else {
        event.reply('login-error', 'Incorrect login credentials');
      }
    });
  }

  init([
    new SystemInfoChannel(),
    new NodeRedResultChannel()
  ]);

} catch (err) {
  console.error(err);
}
