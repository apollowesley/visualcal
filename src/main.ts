
'use strict';

import { BrowserWindow, session } from 'electron';
import menuTemplate from './menu/menu';

import pkg from '../package.json';
let options;
if (pkg.hasOwnProperty("NRelectron")) { options = pkg["NRelectron"] as any }

// Some settings you can edit if you don't set them in package.json
//console.log(options)
const allowLoadSave = options.allowLoadSave || false; // set to true to allow import and export of flow file
const showMap = options.showMap || false;       // set to true to add Worldmap to the menu
const kioskMode = options.kioskMode || false;   // set to true to start in kiosk mode
const addNodes = options.addNodes || true;      // set to false to block installing extra nodes
const template = menuTemplate();

let flowfile = options.flowFile || 'electronflow.json'; // default Flows file name - loaded at start

const urldash = "/ui/#/0";          // url for the dashboard page
const urledit = "/red";             // url for the editor page
const urlconsole = "/console.htm";  // url for the console page
const urlmap = "/worldmap";         // url for the worldmap
const nrIcon = "../../../nodered.png"        // Icon for the app in root dir (usually 256x256)
let urlStart: string;                       // Start on this page
if (options.start.toLowerCase() === "editor") { urlStart = urledit; }
else if (options.start.toLowerCase() === "map") { urlStart = urlmap; }
else { urlStart = urldash; }

// TCP port to use
const listenPort = 18880; // fix it if you like
// const listenPort = Math.random()*16383+49152  // or random ephemeral port

import os from 'os';
import fs from 'fs';
import url from 'url';
import path from 'path';
import http from 'http';
import express from 'express';
import electron from 'electron'; 

const { app, Menu } = electron;
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const Tray = electron.Tray;

import RED from "node-red";
const nodeRed = RED as RED.Red;
var red_app = express();

// Add a simple route for static content served from 'public'
red_app.use("/", express.static("web"));
//red_app.use(express.static(__dirname +"/public"));

// Create a server
var server = http.createServer(red_app);

// Setup user directory and flowfile (if editable)
var userdir = path.join(__dirname, '..');
  // if running as raw electron use the current directory (mainly for dev)
if (process.argv[1] && (process.argv[1] === "main.js")) {
  userdir = path.join(__dirname, '..');
  if ((process.argv.length > 2) && (process.argv[process.argv.length - 1].indexOf(".json") > -1)) {
    if (path.isAbsolute(process.argv[process.argv.length - 1])) {
      flowfile = process.argv[process.argv.length - 1];
    }
    else {
      flowfile = path.join(process.cwd(), process.argv[process.argv.length - 1]);
    }
  }
}
else { // We set the user directory to be in the users home directory...
  userdir = os.homedir() + '/.node-red';
  if (!fs.existsSync(userdir)) {
    fs.mkdirSync(userdir);
  }
  if ((process.argv.length > 1) && (process.argv[process.argv.length - 1].indexOf(".json") > -1)) {
    if (path.isAbsolute(process.argv[process.argv.length - 1])) {
      flowfile = process.argv[process.argv.length - 1];
    }
    else {
      flowfile = path.join(process.cwd(), process.argv[process.argv.length - 1]);
    }
  }
  else {
    if (!fs.existsSync(userdir + "/" + flowfile)) {
      fs.writeFileSync(userdir + "/" + flowfile, fs.readFileSync(__dirname + "/" + flowfile));
    }
    let credFile = flowfile.replace(".json", "_cred.json");
    if (fs.existsSync(__dirname + "/" + credFile) && !fs.existsSync(userdir + "/" + credFile)) {
      fs.writeFileSync(userdir + "/" + credFile, fs.readFileSync(__dirname + "/" + credFile));
    }
  }
}
// console.log("CWD",process.cwd());
// console.log("DIR",__dirname);
// console.log("UserDir :",userdir);
// console.log("FlowFile :",flowfile);
// console.log("PORT",listenPort);

// Keep a global reference of the window objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow;
let conWindow: BrowserWindow;
let tray;
let logBuffer: string[] = [];
let logLength = 250;    // No. of lines of console log to keep.
const levels = ["", "fatal", "error", "warn", "info", "debug", "trace"];

ipc.on('clearLogBuffer', function () { logBuffer = []; });

// Create the settings object - see default settings.js file for other options
var settings = {
  readOnly: true,
  uiHost: "localhost",    // only allow local connections, remove if you want to allow external access
  httpAdminRoot: "/red",  // set to false to disable editor and deploy
  httpNodeRoot: "/",
  userDir: userdir,
  flowFile: flowfile,
  editorTheme: { projects: { enabled: false }, palette: { editable: addNodes } },    // enable projects feature
  functionGlobalContext: {},    // enables global context - add extras ehre if you need them
  logging: {
    websock: {
      level: 'info',
      metrics: false,
      handler: function () {
        return function (msg: any) {
          var ts = (new Date(msg.timestamp)).toISOString();
          ts = ts.replace("Z", " ").replace("T", " ");
          var line = "";
          if (msg.type && msg.id) {
            line = ts + " : [" + levels[msg.level / 10] + "] [" + msg.type + ":" + msg.id + "] " + msg.msg;
          }
          else {
            line = ts + " : [" + levels[msg.level / 10] + "] " + msg.msg;
          }
          logBuffer.push(line);
          if (conWindow) { conWindow.webContents.send('debugMsg', line); }
          if (logBuffer.length > logLength) { logBuffer.shift(); }
        }
      }
    }
  }
};

// Initialise the runtime with a server and settings
nodeRed.init(server, settings);

// Serve the editor UI from /red
red_app.use(settings.httpAdminRoot, nodeRed.httpAdmin);

// Serve the http nodes UI from /
red_app.use(settings.httpNodeRoot, nodeRed.httpNode);

// Create the main browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Node-RED",
    width: 1024,
    height: 768,
    icon: path.join(__dirname, nrIcon),
    fullscreenable: true,
    autoHideMenuBar: false,
    kiosk: kioskMode,
    webPreferences: {
      nodeIntegration: false
    }
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (process.platform !== 'darwin') { mainWindow.setAutoHideMenuBar(true); }
  mainWindow.loadURL(`file://${path.join(__dirname, '..', '..', 'load.html')}`);

  // did-get-response-details
  const filter = {
    urls: [
      "http://localhost:" + listenPort + urlStart
    ]
  }
  session.defaultSession.webRequest.onCompleted(filter, (details) => {
    if ((details.statusCode == 404) && (details.url === ("http://localhost:" + listenPort + urlStart))) {
      setTimeout(mainWindow.webContents.reload, 250);
    }
  });

  // mainWindow.webContents.on('did-finish-load', (a) => {
  //     console.log("FINISHED LOAD",a);
  // });

  mainWindow.webContents.on("new-window", function (e, url, frameName, disposition, option) {
    // if a child window opens... modify any other options such as width/height, etc
    // in this case make the child overlap the parent exactly...
    //console.log("NEW WINDOW",url);
    var w = mainWindow.getBounds();
    option.x = w.x;
    option.y = w.y;
    option.width = w.width;
    option.height = w.height;
  })

  mainWindow.on('close', function (e) {
    const choice = dialog.showMessageBoxSync(this, {
      type: 'question',
      icon: nrIcon,
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to quit?'
    });
    if (choice === 1) {
      e.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Start the app full screen
  //mainWindow.setFullScreen(true)

  // Open the DevTools at start
  //mainWindow.webContents.openDevTools();
}

// Create the tray icon and context menu
function createTray() {
  tray = new Tray(path.join(__dirname, '..', '..', "nrtray.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: function () {
        mainWindow.show();
      }
    },
    {
      label: 'Quit',
      click: function () {
        app.quit();
      }
    }
  ]);
  tray.setToolTip('Node-RED Electron application.')
  tray.setContextMenu(contextMenu);
}


// Called when Electron has finished initialization and is ready to create browser windows.
app.on('ready', () => {
  createTray()
  createWindow()
})



// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') { app.quit(); }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
    mainWindow.loadURL("http://localhost:" + listenPort + urlStart);
  }
});

if (process.platform === 'darwin') {
  app.setAboutPanelOptions({
    applicationVersion: pkg.version,
    version: pkg.dependencies["node-red"],
    copyright: "Copyright © 2019, " + pkg.author.name,
    credits: "Node-RED and other components are copyright the JS Foundation and other contributors."
  });
  // Don't show in the dock bar if you like
  //app.dock.hide();
}

// Start the Node-RED runtime, then load the inital dashboard page
nodeRed.start().then(function () {
  server.listen(listenPort, 'localhost', function () {
    mainWindow.loadURL("http://localhost:" + listenPort + urlStart);
  });
});
