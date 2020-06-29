import path from 'path';
import { serverListenPort, dirs, publicPath, files } from '../common/global-window-info';
import { ipcRenderer } from 'electron';
import { isDev } from '../main/utils/is-dev-mode';
import fs from 'fs';
import { RendererProcedureManager } from './managers/RendererProcedureManager';

window.visualCal = {
  isMac: process.platform === 'darwin',
  isDev: isDev(),
  electron: {
    ipc: ipcRenderer,
    getVisualCalWindowId: () => ipcRenderer.send('get-visualcal-window-id-req'),
    showWindow: (windowId: VisualCalWindow) => ipcRenderer.send('show-window', windowId)
  },
  config: {
    httpServer: {
      port: serverListenPort
    }
  },
  dirs: dirs,
  files: files,
  log: {
    result(result: LogicResult) {
      ipcRenderer.send('node-red', result);
    }
  },
  procedureManager: new RendererProcedureManager(),
  assets: {
    basePath: path.resolve(publicPath),
    get: (name: string) => fs.readFileSync(path.resolve(publicPath, name))
  }
};
