import { app, BrowserWindow, dialog } from 'electron';
import express from 'express';
import * as http from 'http';
import path from 'path';
import { init as initGlobal } from './InitGlobal';
import { ProcedureManager } from './managers/ProcedureManager';
import { init as initMainMenu } from './menu';
import NodeRedSettings from './node-red-settings';
import { VisualCalLogicServerFileSystem } from './node-red/storage/index';
import { init as nodeRedUtilsInit } from './node-red/utils';
import fs, { promises as fsPromises } from 'fs';
import fsExtra from 'fs-extra';
import { isDev } from './utils/is-dev-mode';
import electronIpcLog from 'electron-ipc-log';
import { init as initUdpDiscovery } from './servers/udp-discovery';
import autoUpdate from './auto-update';

const nodeRedApp = express();
const httpServer = http.createServer(nodeRedApp);

electronIpcLog((event: ElectronIpcLogEvent) => {
  var { channel, data, sent, sync } = event;
  var args = [sent ? '⬆️' : '⬇️', channel ]; //, ...data];
  if (sync) args.unshift('ipc:sync');
  else args.unshift('ipc');
  console.info(...args);
});

async function ensureNodeRedNodeExamplesDirExists(appBaseDirPath: string) {
  if (isDev()) return; // We use the demo directory, in this repo, during dev.  So, prevent copying over the same directory/files.
  const nodeRedNodeExamplesDirPath = path.join(appBaseDirPath, 'node_modules', '@node-red', 'nodes', 'examples');
  if (!fs.existsSync(nodeRedNodeExamplesDirPath)) {
    console.info('node-red nodes examples directory does not exist, creating');
    await fsPromises.mkdir(nodeRedNodeExamplesDirPath);
  } else {
    console.info('node-red nodes examples directory exists');
  }
}

function copyDemo(userHomeDataDirPath: string) {
  const demoDirPath = path.join(global.visualCal.dirs.base, 'demo');
  const demoDirExists = fs.existsSync(userHomeDataDirPath);
  if (demoDirExists) return;
  fs.mkdirSync(userHomeDataDirPath, { recursive: true });
  fsExtra.copySync(demoDirPath, userHomeDataDirPath, { recursive: true });
}

async function load() {
  const appBaseDirPath: string = path.resolve(__dirname, '..', '..');
  let userHomeDataDirPath: string = path.join(app.getPath('documents'), 'IndySoft', 'VisualCal');
  if (isDev()) userHomeDataDirPath = path.join(__dirname, '..', '..', 'demo');
  await ensureNodeRedNodeExamplesDirExists(appBaseDirPath);
  initGlobal(appBaseDirPath, userHomeDataDirPath);
  copyDemo(userHomeDataDirPath);
  await autoUpdate();
  initUdpDiscovery();
  // initMainMenu();
  NodeRedSettings.userDir = path.join(global.visualCal.dirs.userHomeData.base, 'logic');
  NodeRedSettings.storageModule = VisualCalLogicServerFileSystem;
  NodeRedSettings.driversRoot = global.visualCal.dirs.drivers.base;
  nodeRedUtilsInit();
  global.visualCal.nodeRed.app.init(httpServer, NodeRedSettings);
  nodeRedApp.use(NodeRedSettings.httpAdminRoot, global.visualCal.nodeRed.app.httpAdmin);
  nodeRedApp.use(NodeRedSettings.httpNodeRoot, global.visualCal.nodeRed.app.httpNode);
  nodeRedApp.use('/nodes-public', express.static(global.visualCal.dirs.html.js)); // Some node-red nodes need external JS files, like indysoft-scalar-result needs quantities.js      
  httpServer.listen(global.visualCal.config.httpServer.port, 'localhost', async () => {
    try {
      await global.visualCal.nodeRed.app.start();
      await ProcedureManager.loadActive();
    } catch (error) {
      console.error(error);
    }
  });
}

function testingOnly() {
  // TODO: TESTING ONLY!!!
}

app.on('ready', async () => {
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await global.visualCal.windowManager.ShowMain();
  });
  try {
    initMainMenu();
    await load();
    await global.visualCal.windowManager.ShowLoading(async () => {
      await global.visualCal.windowManager.ShowLogin();
      if (global.visualCal.windowManager.loginWindow) global.visualCal.windowManager.loginWindow.once('maximize', () => {
        global.visualCal.userManager.active = {
          email: 'test@test.com',
          nameFirst: 'User',
          nameLast: 'App'
        };
      });
      if (isDev()) testingOnly();
    });
  } catch (error) {
    dialog.showErrorBox('Oops!  Something went wrong', error.message);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
