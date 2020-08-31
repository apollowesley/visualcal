import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import electronIpcLog from 'electron-ipc-log';
import electronLog from 'electron-log';
import fs, { promises as fsPromises } from 'fs';
import fsExtra from 'fs-extra';
import RED from 'node-red';
import path from 'path';
import { NodeRed as RealNodeRed } from '../@types/logic-server';
import { AutoUpdater } from './auto-update';
import { init as initGlobal } from './InitGlobal';
import { ProcedureManager } from './managers/ProcedureManager';
import { init as initMainMenu } from './menu';
import NodeRed, { destroy as destroyNodeRed } from './node-red';
import VisualCalNodeRedSettings from './node-red-settings';
import { VisualCalLogicServerFileSystem } from './node-red/storage/index';
import { init as nodeRedUtilsInit } from './node-red/utils';
import { isDev } from './utils/is-dev-mode';

const log = electronLog.scope('main');
const nodeRed = NodeRed();
const autoUpdater = new AutoUpdater();

electronLog.transports.file.level = 'debug';
electronLog.transports.console.level = 'debug';
electronLog.catchErrors();
Object.assign(console, electronLog.functions);

electronIpcLog((event: ElectronIpcLogEvent) => {
  var { channel, sent, sync } = event;
  var args = [sent ? 'sent' : 'received', channel]; //, ...data];
  if (sync) args.unshift('ipc:sync');
  else args.unshift('ipc');
  log.info(...args);
});

async function ensureNodeRedNodeExamplesDirExists(appBaseDirPath: string) {
  if (isDev()) return; // We use the demo directory, in this repo, during dev.  So, prevent copying over the same directory/files.
  const nodeRedNodeExamplesDirPath = path.join(appBaseDirPath, 'node_modules', '@node-red', 'nodes', 'examples');
  if (!fs.existsSync(nodeRedNodeExamplesDirPath)) {
    log.info('node-red nodes examples directory does not exist, creating');
    await fsPromises.mkdir(nodeRedNodeExamplesDirPath);
  } else {
    log.info('node-red nodes examples directory exists');
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
};

async function load() {
  ipcMain.sendToAll = (channelName, args) => BrowserWindow.getAllWindows().forEach(w => { if (!w.isDestroyed()) w.webContents.send(channelName, args); });
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
  VisualCalNodeRedSettings.userDir = path.join(global.visualCal.dirs.userHomeData.base, 'logic');
  VisualCalNodeRedSettings.storageModule = VisualCalLogicServerFileSystem;
  VisualCalNodeRedSettings.driversRoot = global.visualCal.dirs.drivers.base;
  sendToLoadingWindow('Initializing Logic Server utils ...');
  nodeRedUtilsInit();
  sendToLoadingWindow('Initializing Logic Server ...');
  nodeRed.once('started', async (port) => {
    log.info(`Logic server started on port ${port}`);
    await ProcedureManager.loadActive();
  });
  await nodeRed.start(VisualCalNodeRedSettings, global.visualCal.dirs.html.js, global.visualCal.config.httpServer.port);
  global.visualCal.nodeRed.app = RED as RealNodeRed;
}

async function testingOnly() {
  // TODO: TESTING ONLY!!!
  return Promise.resolve();
}

const run = async () => {
  await app.whenReady();
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
  app.on('activate', async () => { if (BrowserWindow.getAllWindows().length === 0) await global.visualCal.windowManager.ShowMain(); });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  autoUpdater.abort();
  log.info('Destroying logic server');
  await destroyNodeRed();
  log.info('Logic server destroyed');
});

run();
