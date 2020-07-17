import { app, BrowserWindow, dialog } from 'electron';
import express from 'express';
import * as http from 'http';
import path from 'path';
import { FileManager } from '../common/managers/FileManager';
import { init as initGlobal } from './InitGlobal';
import { ProcedureManager } from './managers/ProcedureManager';
import { init as initMainMenu } from './menu';
import NodeRedSettings from './node-red-settings';
import { VisualCalLogicServerFileSystem } from './node-red/storage/index';
import { init as nodeRedUtilsInit } from './node-red/utils';
import fs, { promises as fsPromises } from 'fs';
import fsExtra from 'fs-extra';
import { isDev } from './utils/is-dev-mode';
import electronManager, { logger } from '@hashedin/electron-manager';

const nodeRedApp = express();
const httpServer = http.createServer(nodeRedApp);

async function ensureNodeRedNodeExamplesDirExists(appBaseDirPath: string) {
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
  if (!fs.existsSync(userHomeDataDirPath)) fs.mkdirSync(userHomeDataDirPath, { recursive: true });
  fsExtra.copySync(demoDirPath, userHomeDataDirPath, { recursive: true });
}

async function load() {
  electronManager.init();
  logger.init();
  const appBaseDirPath: string = path.resolve(__dirname, '..', '..');
  const userHomeDataDirPath: string = path.join(app.getPath('documents'), 'IndySoft', 'VisualCal');
  await ensureNodeRedNodeExamplesDirExists(appBaseDirPath);
  initGlobal(appBaseDirPath, userHomeDataDirPath);
  copyDemo(userHomeDataDirPath);
  // initMainMenu();
  const fileManager = new FileManager(appBaseDirPath, userHomeDataDirPath);
  await fileManager.ensureInitizilied();
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
      await global.visualCal.windowManager.ShowMain();
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
