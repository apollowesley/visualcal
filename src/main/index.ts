import 'module-alias/register';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import express from 'express';
import * as http from 'http';
import * as RED from "node-red";
import * as path from 'path';
import { IpcChannel } from "./IPC/IpcChannel";
import { NodeRedResultChannel } from "./IPC/NodeRedResultChannel";
import { SystemInfoChannel } from "./IPC/SystemInfoChannel";
import { init as initMainMenu } from './menu';
import NodeRedSettings from './node-red-settings';
import * as UserHomeUtils from './utils/HomeDir';
import { login, isLoggedIn } from './security';
import './InitGlobal'; // TODO: Does it matter where this is located in the order of imports?

try {

  let mainWindow: BrowserWindow | null = null;
  const nodeRedApp = express();
  const httpServer = http.createServer(nodeRedApp);
  const nodeRed = RED as RED.Red;

  function init(ipcChannels: IpcChannel<any>[]) {
    ipcMain.on('vue-test', (_, args) => {
      console.info('From node-red node', args);
    });
    registerIpcChannels(ipcChannels);
    app.on('ready', async () => await onAppReady());
    app.on('window-all-closed', onWindowAllClosed);
    app.on('activate', onActive);
    nodeRed.init(httpServer, NodeRedSettings);
    nodeRedApp.use(NodeRedSettings.httpAdminRoot, nodeRed.httpAdmin);
    nodeRedApp.use(NodeRedSettings.httpNodeRoot, nodeRed.httpNode);
    if (global.visualCal.isDev) nodeRedApp.use('/', express.static(global.visualCal.dirs.html.vue));
  }

  function registerIpcChannels(ipcChannels: IpcChannel<string>[]) {
    ipcChannels.forEach(channel => ipcMain.on(channel.getName(), (event, request) => channel.handle(event, request)));
  }

  async function onAppReady() {
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
    if (isLoggedIn() && mainWindow) {
      mainWindow.show();
      return;
    }
    if (!isLoggedIn()) {
      await createLoginWindow();
      return;
    }
    ipcMain.on('vue-test', (event) => {
      event.reply({ test: 'Hi there!' });
    });
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
