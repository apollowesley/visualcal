import * as fs from 'fs';
import { BrowserWindow, dialog } from 'electron';
import * as path from 'path';
import * as RED from 'node-red';
import { ConsoleWindowConfig } from '../managers/WindowConfigs';

const nodeRed = RED as RED.Red;

let fileName = "";
export const saveFlow = async (mainWindow: BrowserWindow) => {
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

export default {
  saveFlow,
  openFlow
}
