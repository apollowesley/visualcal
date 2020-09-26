import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import electronIpcLog from 'electron-ipc-log';
import electronLog from 'electron-log';
import fs, { promises as fsPromises } from 'fs';
import fsExtra from 'fs-extra';
import RED from 'node-red';
import path from 'path';
import { NodeRed as RealNodeRed } from '../@types/logic-server';
import { VisualCalWindow } from '../constants';
import { init as initGlobal } from './InitGlobal';
import initIpcMonitor from './ipc';
import { ApplicationManager } from './managers/ApplicationManager';
import NodeRed from './node-red';
import VisualCalNodeRedSettings from './node-red-settings';
import { VisualCalLogicServerFileSystem } from './node-red/storage/index';
import { init as nodeRedUtilsInit } from './node-red/utils';
import { isDev } from './utils';
import { setNoUpdateNotifier } from './utils/npm-update-notifier';
import { VueManager } from './managers/VueManager';
import { ExpressServer } from './servers/express';
import { WindowManager } from './managers/WindowManager';

// *** TESTING NI-GPIB DRIVER ***
// import IndySoftNIGPIB from 'indysoft-ni-gpib';

// const ident = IndySoftNIGPIB();
// console.info(ident);

NodeRed();
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

function copyDemo(userHomeDataDirPath: string) {
  const demoDirPath = path.join(global.visualCal.dirs.base, 'demo');
  const demoDirExists = fs.existsSync(userHomeDataDirPath);
  if (demoDirExists) return;
  fs.mkdirSync(userHomeDataDirPath, { recursive: true });
  fsExtra.copySync(demoDirPath, userHomeDataDirPath, { recursive: true });
}

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

async function load() {
  setNoUpdateNotifier(false);
  ipcMain.sendToAll = (channelName, args) => BrowserWindow.getAllWindows().forEach(w => { if (!w.isDestroyed()) w.webContents.send(channelName, args); });
  log.info('Initializing main menu ...');
  const appBaseDirPath: string = path.resolve(__dirname, '..', '..');
  let userHomeDataDirPath: string = path.join(app.getPath('documents'), 'IndySoft', 'VisualCal');
  await ensureNodeRedNodeExamplesDirExists(appBaseDirPath);
  if (isDev()) userHomeDataDirPath = path.join(__dirname, '..', '..', 'demo');
  log.info('Initializing global ...');
  initGlobal(appBaseDirPath, userHomeDataDirPath);
  await WindowManager.instance.ShowLoading();
  log.info('Ensuring demo exists in user folder ...');
  copyDemo(userHomeDataDirPath);
  VisualCalNodeRedSettings.userDir = path.join(global.visualCal.dirs.userHomeData.base, 'logic');
  VisualCalNodeRedSettings.storageModule = VisualCalLogicServerFileSystem;
  VisualCalNodeRedSettings.driversRoot = global.visualCal.dirs.drivers.base;
  log.info('Initializing Logic Server utils ...');
  await ExpressServer.instance.start(global.visualCal.config.httpServer.port);
  await nodeRedUtilsInit();
  global.visualCal.nodeRed.app = RED as RealNodeRed;
  initIpcMonitor();
  VueManager.instance.once('loaded', () => console.info('VueManager.loaded'));
}

async function testingOnly() {
  // TODO: TESTING ONLY!!!
  await Promise.resolve();
}

const run = async () => {
  await app.whenReady();
  if (isDev()) {
    try {
      const VueDevTools = require('vue-devtools');
      VueDevTools.install();
    } catch (error) {
      console.warn('The following error from vue-devtools can be ignored.  It is only loaded in development.');
      console.error(error.message);
    }
  }
  ApplicationManager.instance.on('readyToLoad', async () => {
    try {
      Menu.setApplicationMenu(null);
      await load();
      global.visualCal.userManager.once('loggedIn', async () => {
        try {
          await ApplicationManager.instance.checkForUpdates();
        } catch (error) {
          log.error('Error checking for updates', error);
        }
      });
      await WindowManager.instance.ShowLogin();
      WindowManager.instance.close(VisualCalWindow.Loading);
      if (isDev()) {
        await testingOnly();
      }
    } catch (error) {
      log.error(error.message);
      log.error(error);
      dialog.showErrorBox('Oops!  Something went wrong - See log file for details', error.message);
    }
  });
  ApplicationManager.instance.init();
}

run();
