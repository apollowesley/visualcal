import fs from 'fs';
import { BrowserWindow, dialog, NativeImage } from 'electron';
import path from 'path';
import RED from 'node-red';

const nodeRed = RED as RED.Red;

let fileName = "";
export const saveFlow = async (nrIcon: string) => {
  const result = await dialog.showSaveDialog(null, {
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

export const openFlow = async () => {
  const result = await dialog.showOpenDialog(null, { filters: [{ name: 'JSON', extensions: ['json'] }] });
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
export const createConsole = (conWindow: BrowserWindow, nrIcon: string, urlConsole: string, logBuffer: string[]) => {
  if (conWindow) { conWindow.show(); return; }
  // Create the hidden console window
  conWindow = new BrowserWindow({
    title: "Node-RED Console",
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
    conWindow.webContents.send('logBuff', logBuffer);
  });
  conWindow.on('closed', () => {
    conWindow = null;
  });
  //conWindow.webContents.openDevTools();
}

export default {
  saveFlow,
  openFlow,
  createConsole
}
