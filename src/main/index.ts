import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import electronIpcLog from 'electron-ipc-log';
import electronLog from 'electron-log';
import fs, { promises as fsPromises } from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import { VisualCalWindow } from '../constants';
import { installVueDevTools } from './dev';
import { init as initGlobal } from './InitGlobal';
import initIpcMonitor from './ipc';
import { ApplicationManager } from './managers/ApplicationManager';
import { DriverBuilder } from './managers/DriverBuilder';
import { VueManager } from './managers/VueManager';
import { WindowManager } from './managers/WindowManager';
import { init as initMainMenu } from './menu';
import VisualCalNodeRedSettings from './node-red/settings';
import { VisualCalLogicServerFileSystem } from './node-red/storage/index';
import { ExpressServer } from './servers/express';
import { getUserHomeDataPathDir, isDev } from './utils';
import { setNoUpdateNotifier } from './utils/npm-update-notifier';

// *** TESTING NI-GPIB DRIVER ***
// import IndySoftNIGPIB from 'indysoft-ni-gpib';

// const ident = IndySoftNIGPIB();
// console.info(ident);

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

const copyDemo = async (userHomeDataDirPath: string) => {
  const demoDirPath = path.join(global.visualCal.dirs.base, 'demo');
  const demoDirExists = fs.existsSync(userHomeDataDirPath);
  if (demoDirExists) return;
  await fsPromises.mkdir(userHomeDataDirPath, { recursive: true });
  await fsExtra.copy(demoDirPath, userHomeDataDirPath, { recursive: true });
}

const ensureNodeRedNodeExamplesDirExists = async (appBaseDirPath: string) => {
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
  log.info('Initializing main menu');
  const appBaseDirPath: string = path.resolve(__dirname, '..', '..');
  let userHomeDataDirPath: string = path.join(app.getPath('documents'), 'IndySoft', 'VisualCal');
  await ensureNodeRedNodeExamplesDirExists(appBaseDirPath);
  userHomeDataDirPath = getUserHomeDataPathDir(userHomeDataDirPath);
  log.info('Initializing global');
  WindowManager.instance.init();
  initGlobal(appBaseDirPath, userHomeDataDirPath);
  await WindowManager.instance.ShowLoading();
  log.info('Ensuring demo exists in user folder');
  await copyDemo(userHomeDataDirPath);
  VisualCalNodeRedSettings.userDir = path.join(global.visualCal.dirs.userHomeData.base, 'logic');
  VisualCalNodeRedSettings.storageModule = VisualCalLogicServerFileSystem;
  log.info('Initializing Logic Server utils');
  await ExpressServer.instance.start(global.visualCal.config.httpServer.port);
  if (isDev()) initIpcMonitor();
  VueManager.instance.once('loaded', () => console.info('VueManager.loaded'));
}

// TODO: TESTING ONLY!!!
async function testingOnly() {
  // if (!isDev()) return; // Online needed when there's something to test here
  return;
}

const run = async () => {
  await app.whenReady();
  installVueDevTools();
  ApplicationManager.instance.on('readyToLoad', async () => {
    try {
      initMainMenu();
      await load();
      await WindowManager.instance.ShowLogin();
      WindowManager.instance.closeAllBut(VisualCalWindow.Login);
      await testingOnly();
    } catch (error) {
      log.error(error.message);
      log.error(error);
      dialog.showErrorBox('Oops!  Something went wrong - See log file for details', error.message);
    }
  });
  ApplicationManager.instance.init();
  DriverBuilder.instance.init();
};

run();
