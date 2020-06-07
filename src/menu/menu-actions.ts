import fs from 'fs';
import { BrowserWindow, dialog, NativeImage } from 'electron';
import path from 'path';
import RED from 'node-red';

const nodeRed = RED as RED.Red;

let fileName = "";
export const saveFlow = async (mainWindow: BrowserWindow, nrIcon: string) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'JSON', extensions: ['json'] }],
    defaultPath: fileName
  });
  if (result.filePath) {
    var flo = JSON.stringify(nodeRed.nodes.getFlows().flows);
    fs.writeFile(result.filePath, flo, function (err) {
      if (err) { dialog.showErrorBox('Error', JSON.stringify(err)); }
      else {
        dialog.showMessageBox({
          icon: NativeImage.createFromPath(nrIcon),
          message: "Flow file saved as\n\n" + result.filePath,
          buttons: ["OK"]
        });
      }
    });
  }
}

export const openFlow = async (mainWindow: BrowserWindow) => {
  const result = await dialog.showOpenDialog(mainWindow, { filters: [{ name: 'JSON', extensions: ['json'] }] });
  result.filePaths.forEach(filePath => {
    fs.readFile(filePath, 'utf-8', function (err, data) {
      try {
        var flo = JSON.parse(data);
        if (Array.isArray(flo) && (flo.length > 0)) {
          nodeRed.nodes.setFlows(flo, "full");
          fileName = filePath;
        } else {
          dialog.showErrorBox("Error", "Failed to parse flow file.\n\n  " + filePath + ".\n\nAre you sure it's a flow file ?");
        }
      } catch (e) {
        dialog.showErrorBox("Error", "Failed to load flow file.\n\n  " + filePath);
      }
    });
  });
}

// Create the console log window
export const createConsole = (conWindow: BrowserWindow | undefined, nrIcon: string, urlConsole: string, logBuffer: string[]) => {
  if (conWindow) {
    console.info('Console window already exists');
    conWindow.show();
    return;
  }
  console.info('Creating console');
  // Create the hidden console window
  conWindow = new BrowserWindow({
    title: "VisualCal Console",
    width: 800,
    height: 600,
    icon: path.join(__dirname, nrIcon),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  conWindow.loadURL(`file://${path.join(__dirname, urlConsole)}`);
  conWindow.webContents.on('did-finish-load', () => {
    if (conWindow) conWindow.webContents.send('logBuff', logBuffer);
  });
  conWindow.on('closed', () => {
    conWindow = undefined;
  });
  //conWindow.webContents.openDevTools();
  return conWindow;
}

export default {
  saveFlow,
  openFlow,
  createConsole
}
