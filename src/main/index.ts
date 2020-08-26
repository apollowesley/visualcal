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
// import { init as initUdpDiscovery } from './servers/udp-discovery';
import { AutoUpdater } from './auto-update';

const nodeRedApp = express();
const httpServer = http.createServer(nodeRedApp);
const autoUpdater = new AutoUpdater();

electronIpcLog((event: ElectronIpcLogEvent) => {
  var { channel, data, sent, sync } = event;
  var args = [sent ? 'sent' : 'received', channel ]; //, ...data];
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

const sendToLoadingWindow = (text: string) => {
  if (!global.visualCal || !global.visualCal.windowManager) return;
  const loadingWindow = global.visualCal.windowManager.loadingWindow;
  if (!loadingWindow) return;
  loadingWindow.webContents.send('update-loading-text', text);
}

async function load() {
  sendToLoadingWindow('Initializing main menu ...');
  initMainMenu();
  const appBaseDirPath: string = path.resolve(__dirname, '..', '..');
  let userHomeDataDirPath: string = path.join(app.getPath('documents'), 'IndySoft', 'VisualCal');
  if (isDev()) userHomeDataDirPath = path.join(__dirname, '..', '..', 'demo');
  sendToLoadingWindow('Ensuring Logic Server examples folder exists ...');
  await ensureNodeRedNodeExamplesDirExists(appBaseDirPath);
  sendToLoadingWindow('Initializing global ...');
  initGlobal(appBaseDirPath, userHomeDataDirPath);
  await global.visualCal.windowManager.ShowLoading();
  sendToLoadingWindow('Ensuring demo exists in user folder ...');
  copyDemo(userHomeDataDirPath);
  // initUdpDiscovery();
  NodeRedSettings.userDir = path.join(global.visualCal.dirs.userHomeData.base, 'logic');
  NodeRedSettings.storageModule = VisualCalLogicServerFileSystem;
  NodeRedSettings.driversRoot = global.visualCal.dirs.drivers.base;
  sendToLoadingWindow('Initializing Logic Server utils ...');
  nodeRedUtilsInit();
  sendToLoadingWindow('Initializing Logic Server ...');
  // TODO: The follow works to intercept node-red loading, inject a custom index.html and load scripts.  Figure out how to make it useful.  Currently throws exports not defined error.
  // nodeRedApp.use((_, res, next) => {
  //   const oldSend = res.send;
  //   (res.send as any) = function(body?: any) {
  //     if (body && typeof body === 'string' && body.includes('<title>VisualCal Logic Editor</title>')) {
  //       body = fs.readFileSync(path.join(global.visualCal.dirs.html.windows, 'node-red.html')).toString('utf-8');
  //     }
  //     res.send = oldSend;
  //     return res.send(body);
  //   }
  //   return next();
  // });
  // nodeRedApp.use('/red/visualcal/d3.js', (_, res) => res.sendFile(path.join(appBaseDirPath, 'node_modules', 'd3', 'dist', 'd3.min.js')));
  // nodeRedApp.use('/red/renderers/window.js', (_, res) => res.sendFile(path.join(global.visualCal.dirs.renderers.base, 'window.js')));
  // nodeRedApp.use('/red/renderers/windows/node-red.js', (_, res) => res.sendFile(path.join(global.visualCal.dirs.renderers.windows, 'node-red.js')));
  global.visualCal.nodeRed.app.init(httpServer, NodeRedSettings);
  nodeRedApp.use(NodeRedSettings.httpAdminRoot, global.visualCal.nodeRed.app.httpAdmin);
  nodeRedApp.use(NodeRedSettings.httpNodeRoot, global.visualCal.nodeRed.app.httpNode);
  nodeRedApp.use('/nodes-public', express.static(global.visualCal.dirs.html.js)); // Some node-red nodes need external JS files, like indysoft-scalar-result needs quantities.js
  sendToLoadingWindow('Starting Web Server ...');
  httpServer.listen(global.visualCal.config.httpServer.port, 'localhost', async () => {
    try {
      sendToLoadingWindow('Starting Logic Server ...');
      await global.visualCal.nodeRed.app.start();
      await ProcedureManager.loadActive();
    } catch (error) {
      console.error(error);
    }
  });
}

async function testingOnly() {
  // TODO: TESTING ONLY!!!
  return Promise.resolve();
}

app.on('ready', async () => {
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await global.visualCal.windowManager.ShowMain();
  });
  try {
    await load();
    const loginWindow = await global.visualCal.windowManager.ShowLogin();
    global.visualCal.windowManager.close(VisualCalWindow.Loading);
    loginWindow.once('closed', async () => {
      global.visualCal.userManager.active = {
        email: 'test@test.com',
        nameFirst: 'User',
        nameLast: 'App'
      };
      await autoUpdater.checkForUpdates();
    });
    if (isDev()) {
      await testingOnly();
    }
  } catch (error) {
    dialog.showErrorBox('Oops!  Something went wrong', error.message);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  autoUpdater.abort();
  await global.visualCal.nodeRed.app.stop();
  httpServer.close();
});
