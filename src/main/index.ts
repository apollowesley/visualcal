import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import electronIpcLog from 'electron-ipc-log';
import electronLog from 'electron-log';
import fs, { promises as fsPromises } from 'fs';
import fsExtra from 'fs-extra';
import RED from 'node-red';
import path from 'path';
import { NodeRed as RealNodeRed } from '../@types/logic-server';
import { init as initGlobal } from './InitGlobal';
import initIpcMonitor from './ipc';
import { ApplicationManager } from './managers/ApplicationManager';
import { init as initMainMenu } from './menu';
import NodeRed from './node-red';
import VisualCalNodeRedSettings from './node-red-settings';
import { VisualCalLogicServerFileSystem } from './node-red/storage/index';
import { init as nodeRedUtilsInit } from './node-red/utils';
import { isDev } from './utils/is-dev-mode';
import { setNoUpdateNotifier } from './utils/npm-update-notifier';

const nodeRed = NodeRed();
const log = electronLog.scope('main');

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
  setImmediate(() => loadingWindow.webContents.send('update-loading-text', text));
};

async function load() {
  setNoUpdateNotifier(false);
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
  global.visualCal.nodeRed.app = RED as RealNodeRed;
  initIpcMonitor();
}

async function testingOnly() {
  // TODO: TESTING ONLY!!!
  return Promise.resolve();
}

const run = async () => {
  await app.whenReady();
  ApplicationManager.instance.on('readyToLoad', async () => {
    try {
      await load()
      const loginWindow = await global.visualCal.windowManager.ShowLogin();
      global.visualCal.windowManager.close(VisualCalWindow.Loading);
      loginWindow.once('closed', async () => {
        try {
          await ApplicationManager.instance.checkForUpdates();
        } catch (error) {
          log.error('Error checking for updates', error);
        }
      });
      if (isDev()) {
        await testingOnly();
      }
    } catch (error) {
      dialog.showErrorBox('Oops!  Something went wrong', error.message);
    }
  });
  ApplicationManager.instance.init();
}

run();
