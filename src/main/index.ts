import { app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from 'electron';
import express from 'express';
import * as http from 'http';
import path from 'path';
import { FileManager } from '../common/managers/FileManager';
import { EmulatedCommunicationInterface } from '../drivers/communication-interfaces/EmulatedCommunicationInterface';
import { init as initGlobal } from './InitGlobal';
import { ProcedureManager } from './managers/ProcedureManager';
import { init as initMainMenu } from './menu';
import NodeRedSettings from './node-red-settings';
import { VisualCalLogicServerFileSystem } from './node-red/storage/index';
import { addCommunicationInterface, addCommunicationInterfaceForDevice, init as nodeRedUtilsInit } from './node-red/utils';
import { WindowManager } from './managers/WindowManager';

const nodeRedApp = express();
const httpServer = http.createServer(nodeRedApp);
let mainWindow: BrowserWindow | null = null;

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.visualCal.id = VisualCalWindow.Main;
  await mainWindow.loadFile(path.join(global.visualCal.dirs.html.bootstrapStudio, 'index.html'));
}

async function load() {
  const appBaseDirPath: string = path.resolve(__dirname, '..', '..'); // <base>/dist
  const userHomeDataDirPath: string = path.join(app.getPath('documents'), 'IndySoft', 'VisualCal');
  initGlobal(appBaseDirPath, userHomeDataDirPath);
  // initMainMenu();
  const fileManager = new FileManager(appBaseDirPath, userHomeDataDirPath);
  await fileManager.ensureInitizilied();
  NodeRedSettings.userDir = path.join(global.visualCal.dirs.userHomeData.base, 'logic');
  NodeRedSettings.storageModule = VisualCalLogicServerFileSystem;
  NodeRedSettings.driversRoot = global.visualCal.dirs.drivers.base;
  nodeRedUtilsInit();
6
  // TODO: DEMO ONLY!!!
  addCommunicationInterface({
    communicationInterface: new EmulatedCommunicationInterface(),
    name: 'Emulated'
  });
  addCommunicationInterfaceForDevice({
    communicationInterfaceName: 'Emulated',
    deviceName: 'uut',
    deviceDriver: {
      categories: ['digital-multi-meter'],
      deviceModel: '45',
      manufacturer: 'Fluke'
    }
  });
  addCommunicationInterfaceForDevice({
    communicationInterfaceName: 'Emulated',
    deviceName: 'calibrator',
    deviceDriver: {
      categories: ['multi-product-calibrator'],
      deviceModel: '5522A',
      manufacturer: 'Fluke'
    }
  });
  // TODO: END DEMO
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

app.on('ready', async () => {
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await global.visualCal.windowManager.ShowMain();
  });
  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      role: 'fileMenu'
    },
    {
      role: 'editMenu'
    },
    {
      role: 'viewMenu'
    },
    {
      role: 'windowMenu'
    }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  load();
  await global.visualCal.windowManager.ShowLoading(async () => {
      await global.visualCal.windowManager.ShowMain();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
