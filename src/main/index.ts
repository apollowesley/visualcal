import { IpcChannel } from "@/IPC/IpcChannel";
import { SystemInfoChannel } from "@/IPC/SystemInfoChannel";
import { create as createMenu, Options } from '@/menu';
import NodeRedSettings from '@/node-red-settings';
// import * as pkg from '@root/package.json';
import { app, BrowserWindow, ipcMain, Menu, screen } from 'electron';
import express from 'express';
import fs from 'fs';
import http from 'http';
import RED from "node-red";
import path from 'path';
import './GlobalInit'; // Initialize global.visualcal

const urlStart = 'red';
// const pkgJsonOptions = pkg.NRelectron;



let options: Options = {
  logBuffer: [],
  nrIcon: global.visualCal.config.appIcon
};

  let mainWindow: BrowserWindow | null = null;
  // private conWindow: BrowserWindow | null = null;
  const nodeRedApp = express();
  const httpServer = http.createServer(nodeRedApp);
  const nodeRed = RED as RED.Red;
  // private log: string[] = [];

  function init(ipcChannels: IpcChannel[]) {
    configureApp();
    registerIpcChannels(ipcChannels);
    createHomeDirectory();
    app.on('ready', async () => await createLoadingWindow());
    app.on('window-all-closed', onWindowAllClosed);
    app.on('activate', onActive);
    nodeRed.init(httpServer, NodeRedSettings);
    nodeRedApp.use(NodeRedSettings.httpAdminRoot, nodeRed.httpAdmin);
    nodeRedApp.use(NodeRedSettings.httpNodeRoot, nodeRed.httpNode);
  }

  function onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  async function onActive() {
    if (!mainWindow) {
      await createMainWindow();
    }
  }

  function registerIpcChannels(ipcChannels: IpcChannel[]) {
    ipcChannels.forEach(channel => ipcMain.on(channel.getName(), (event, request) => channel.handle(event, request)));
  }

  function configureApp() {
    const isFirstInstance = app.requestSingleInstanceLock();
    if (!isFirstInstance) app.quit();
    if (app.dock) app.dock.setIcon(global.visualCal.config.appIcon);
    if (app.setUserTasks) app.setUserTasks([
      {
        program: process.execPath,
        arguments: '',
        iconPath: global.visualCal.config.appIcon,
        iconIndex: 0,
        title: 'VisualCal',
        description: 'IndySoft VisualCal'
      }
    ]);
  }

  function createHomeDirectory() {
    if (!fs.existsSync(global.visualCal.dirs.visualCalUser)) fs.mkdirSync(global.visualCal.dirs.visualCalUser);
  }

  async function createLoadingWindow(duration: number = 5000) {
    const cursorScreenPoint = screen.getCursorScreenPoint();
    const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
    let loadingScreen: BrowserWindow | null = new BrowserWindow({
      height: 200,
      width: 400,
      x: nearestScreenToCursor.workArea.x - 200 + nearestScreenToCursor.bounds.width / 2,
      y: nearestScreenToCursor.workArea.y - 200 + nearestScreenToCursor.bounds.height / 2,
      icon: global.visualCal.config.appIcon,
      title: 'VisualCal',
      frame: false,
      transparent: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    loadingScreen.on('closed', () => loadingScreen = null);
    loadingScreen.webContents.on('did-finish-load', () => {
      if (loadingScreen) loadingScreen.show();
      setTimeout(() => {
        if (loadingScreen) loadingScreen.close();
        httpServer.listen(global.visualCal.config.httpServer.port, 'localhost', async () => {
          await nodeRed.start();
          await createMainWindow();
        });
      }, duration);
    });
    await loadingScreen.loadFile(path.join(global.visualCal.dirs.html, 'loading.html'));
  }

  async function createMainWindow() {
    const cursorScreenPoint = screen.getCursorScreenPoint();
    const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
    mainWindow = new BrowserWindow({
      title: "VisualCal",
      width: 1024,
      height: 768,
      icon: global.visualCal.config.appIcon,
      fullscreenable: true,
      autoHideMenuBar: false,
      webPreferences: {
        nodeIntegration: false
      }
    });
    global.visualCal.mainWindow = mainWindow;
    mainWindow.setBounds(nearestScreenToCursor.workArea);
    const menu = Menu.buildFromTemplate(createMenu(options));
    Menu.setApplicationMenu(menu);

    if (process.platform !== 'darwin') mainWindow.setAutoHideMenuBar(true);
    mainWindow.webContents.on('did-finish-load', () => {
      if (!mainWindow) return
      mainWindow.show();
    });
    mainWindow.on('close', (e) => {
      // Required for node-red if it's in a modified state and changes haven't been deployed
      e.preventDefault();
      if (mainWindow) mainWindow.destroy();
      global.visualCal.mainWindow = undefined;
      mainWindow = null;
      app.quit();
    });
    await mainWindow.loadURL(`http://localhost:${global.visualCal.config.httpServer.port}/${urlStart}`);
  }

  // private createConsoleWindow() {

  // }

init([
  new SystemInfoChannel()
]);


// // Some settings you can edit if you don't set them in package.json
// //console.log(options)
// const allowLoadSave = pkgJsonOptions.allowLoadSave || false; // set to true to allow import and export of flow file
// const showMap = pkgJsonOptions.showMap || false;       // set to true to add Worldmap to the menu
// const kioskMode = pkgJsonOptions.kioskMode || false;   // set to true to start in kiosk mode
// const addNodes = pkgJsonOptions.addNodes || true;      // set to false to block installing extra nodes
// let template: Array<(MenuItemConstructorOptions) | (MenuItem)>;

// let flowfile = pkgJsonOptions.flowFile || 'electronflow.json'; // default Flows file name - loaded at start

// const urldash = "/ui/#/0";          // url for the dashboard page
// const urledit = "/red";             // url for the editor page
// const urlconsole = '../../../console.html';  // url for the console page
// const urlmap = "/worldmap";         // url for the worldmap
// const nrIcon = "../../../nodered.png"        // Icon for the app in root dir (usually 256x256)
// let urlStart: string;                       // Start on this page
// if (pkgJsonOptions.start && pkgJsonOptions.start.toLowerCase() === "editor") { urlStart = urledit; }
// else if (pkgJsonOptions.start && pkgJsonOptions.start.toLowerCase() === "map") { urlStart = urlmap; }
// else { urlStart = urldash; }

// // TCP port to use
// const listenPort = 18880; // fix it if you like
// // const listenPort = Math.random()*16383+49152  // or random ephemeral port
// options.listenPort = listenPort;
// options.urlDash = urldash;
// options.urlEdit = urledit;
// options.urlConsole = urlconsole;
// options.urlMap = urlmap;
// options.allowLoadSave = allowLoadSave;
// options.showMap = showMap;
// options.kioskMode = kioskMode;
// options.addNodes = addNodes;
// options.nrIcon = nrIcon;

// const nodeRed = RED as RED.Red;
// var red_app = express();

// const assetsDir = (path.join(__dirname, '..', '..', 'assets'));
// console.info(assetsDir);
// red_app.use('/assets', express.static(assetsDir));

// // Add a simple route for static content served from 'public'
// red_app.use("/", express.static("web"));
// //red_app.use(express.static(__dirname +"/public"));

// // Create a server
// var server = http.createServer(red_app);

// // Setup user directory and flowfile (if editable)
// var userdir = path.join(__dirname, '..');
// // if running as raw electron use the current directory (mainly for dev)
// if (process.argv[process.argv.length - 1] && (process.argv[process.argv.length - 1].endsWith("main.js"))) {
//   userdir = path.join(__dirname, '..');
//   if ((process.argv.length > 2) && (process.argv[process.argv.length - 1].indexOf(".json") > -1)) {
//     if (path.isAbsolute(process.argv[process.argv.length - 1])) {
//       flowfile = process.argv[process.argv.length - 1];
//     }
//     else {
//       flowfile = path.join(process.cwd(), process.argv[process.argv.length - 1]);
//     }
//   }
// }
// else { // We set the user directory to be in the users home directory...
//   userdir = os.homedir() + '/.node-red';
//   if (!fs.existsSync(userdir)) {
//     fs.mkdirSync(userdir);
//   }
//   if ((process.argv.length > 1) && (process.argv[process.argv.length - 1].indexOf(".json") > -1)) {
//     if (path.isAbsolute(process.argv[process.argv.length - 1])) {
//       flowfile = process.argv[process.argv.length - 1];
//     }
//     else {
//       flowfile = path.join(process.cwd(), process.argv[process.argv.length - 1]);
//     }
//   }
//   else {
//     if (!fs.existsSync(userdir + "/" + flowfile)) {
//       fs.writeFileSync(userdir + "/" + flowfile, fs.readFileSync(__dirname + "/" + flowfile));
//     }
//     let credFile = flowfile.replace(".json", "_cred.json");
//     if (fs.existsSync(__dirname + "/" + credFile) && !fs.existsSync(userdir + "/" + credFile)) {
//       fs.writeFileSync(userdir + "/" + credFile, fs.readFileSync(__dirname + "/" + credFile));
//     }
//   }
// }
// // console.log("CWD",process.cwd());
// // console.log("DIR",__dirname);
// // console.log("UserDir :",userdir);
// // console.log("FlowFile :",flowfile);
// // console.log("PORT",listenPort);

// // Keep a global reference of the window objects, if you don't, the window will
// // be closed automatically when the JavaScript object is garbage collected.
// let mainWindow: BrowserWindow | null;
// let conWindow: BrowserWindow | undefined;
// let tray;
// let logBuffer: string[] = [];
// let logLength = 250;    // No. of lines of console log to keep.
// const levels = ["", "fatal", "error", "warn", "info", "debug", "trace"];
// options.conWindow = conWindow;
// options.onConWindowOpened = (cw) => conWindow = cw;
// options.onConWindowClosed = () => conWindow = undefined;
// options.logBuffer = logBuffer;

// ipcMain.on('clearLogBuffer', function () { logBuffer = []; });

// // Create the settings object - see default settings.js file for other options
// var settings = {
//   readOnly: true,
//   uiHost: "localhost",    // only allow local connections, remove if you want to allow external access
//   httpAdminRoot: "/red",  // set to false to disable editor and deploy
//   httpNodeRoot: "/",
//   userDir: userdir,
//   flowFile: flowfile,
//   editorTheme: { projects: { enabled: false }, palette: { editable: addNodes } },    // enable projects feature
//   functionGlobalContext: {},    // enables global context - add extras ehre if you need them
//   logging: {
//     websock: {
//       level: 'info',
//       metrics: false,
//       handler: function () {
//         return function (msg: any) {
//           var ts = (new Date(msg.timestamp)).toISOString();
//           ts = ts.replace("Z", " ").replace("T", " ");
//           var line = "";
//           if (msg.type && msg.id) {
//             line = ts + " : [" + levels[msg.level / 10] + "] [" + msg.type + ":" + msg.id + "] " + msg.msg;
//           }
//           else {
//             line = ts + " : [" + levels[msg.level / 10] + "] " + msg.msg;
//           }
//           logBuffer.push(line);
//           if (conWindow && !conWindow.isDestroyed) { conWindow.webContents.send('debugMsg', line); }
//           if (logBuffer.length > logLength) { logBuffer.shift(); }
//         }
//       }
//     }
//   }
// };

// // Initialise the runtime with a server and settings
// nodeRed.init(server, settings);

// // Serve the editor UI from /red
// red_app.use(settings.httpAdminRoot, nodeRed.httpAdmin);

// // Serve the http nodes UI from /
// red_app.use(settings.httpNodeRoot, nodeRed.httpNode);

// // Create the main browser window
// function createWindow() {
//   // Create the browser window.
//   const cursorScreenPoint = screen.getCursorScreenPoint();
//   const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
//   mainWindow = new BrowserWindow({
//     title: "VisualCal",
//     width: 1024,
//     height: 768,
//     icon: path.join(__dirname, nrIcon),
//     fullscreenable: true,
//     autoHideMenuBar: false,
//     kiosk: kioskMode,
//     webPreferences: {
//       nodeIntegration: false
//     }
//   });
//   mainWindow.setBounds(nearestScreenToCursor.workArea);
//   options.mainWindow = mainWindow;
//   template = menuTemplate(options);
//   const menu = Menu.buildFromTemplate(template);
//   Menu.setApplicationMenu(menu);

//   if (process.platform !== 'darwin') { mainWindow.setAutoHideMenuBar(true); }
//   mainWindow.loadURL("http://localhost:" + listenPort + urlStart);

//   // did-get-response-details
//   const filter = {
//     urls: [
//       "http://localhost:" + listenPort + urlStart
//     ]
//   }
//   session.defaultSession.webRequest.onCompleted(filter, (details) => {
//     if ((details.statusCode == 404) && (details.url === ("http://localhost:" + listenPort + urlStart))) {
//       if (mainWindow) setTimeout(mainWindow.webContents.reload, 2000);
//     }
//   });

//   // mainWindow.webContents.on('did-finish-load', (a) => {
//   //     console.log("FINISHED LOAD",a);
//   // });

//   mainWindow.webContents.on("new-window", function (e, url, frameName, disposition, option) {
//     // if a child window opens... modify any other options such as width/height, etc
//     // in this case make the child overlap the parent exactly...
//     //console.log("NEW WINDOW",url);
//     if (!mainWindow) return;
//     var w = mainWindow.getBounds();
//     option.x = w.x;
//     option.y = w.y;
//     option.width = w.width;
//     option.height = w.height;
//   })

//   mainWindow.on('close', function (e) {
//     if (!options.mainWindow) return;
//     if (conWindow) conWindow.destroy(); conWindow = undefined;
//     const choice = dialog.showMessageBoxSync(options.mainWindow, {
//       type: 'question',
//       icon: nrIcon,
//       buttons: ['Yes', 'No'],
//       title: 'Confirm',
//       message: 'Are you sure you want to quit?'
//     });
//     if (choice === 1) {
//       e.preventDefault();
//     }
//   });

//   mainWindow.on('closed', () => {
//     mainWindow = null;
//   });

//   // Start the app full screen
//   //mainWindow.setFullScreen(true)

//   // Open the DevTools at start
//   //mainWindow.webContents.openDevTools();
// }

// // Create the tray icon and context menu
// function createTray() {
//   tray = new Tray(path.join(__dirname, '..', '..', "nrtray.png"));
//   const contextMenu = Menu.buildFromTemplate([
//     {
//       label: 'Show',
//       click: function () {
//         if (!mainWindow) return;
//         mainWindow.show();
//       }
//     },
//     {
//       label: 'Quit',
//       click: function () {
//         app.quit();
//       }
//     }
//   ]);
//   tray.setToolTip('VisualCal Electron application.')
//   tray.setContextMenu(contextMenu);
// }

// const showLoadingScreen = () => createLoadingScreen(() => createWindow(), 20000);

// // Called when Electron has finished initialization and is ready to create browser windows.
// app.on('ready', async () => {
//   // Start the Node-RED runtime, then load the inital dashboard page
//   server.listen(listenPort, 'localhost', async () => {
//     console.debug('Server started');
//     await nodeRed.start()
//     console.info('Node-Red started');
//     if (mainWindow) mainWindow.loadURL("http://localhost:" + listenPort + urlStart);
//     createTray();
//     await showLoadingScreen();
//   });
// })

// // Quit when all windows are closed.
// app.on('window-all-closed', function () {
//   // On OS X it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (process.platform !== 'darwin') { app.quit(); }
// });

// app.on('activate', function () {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (!mainWindow) {
//     createWindow();
//     if (mainWindow) mainWindow!.loadURL("http://localhost:" + listenPort + urlStart);
//   }
// });

// if (process.platform === 'darwin') {
//   app.setAboutPanelOptions({
//     applicationVersion: pkg.version,
//     version: pkg.dependencies["node-red"],
//     copyright: "Copyright © 2019, " + pkg.author.name,
//     credits: "VisualCal and other components are copyright the IndySoft Corporation and other contributors."
//   });
//   // Don't show in the dock bar if you like
//   //app.dock.hide();
// }
