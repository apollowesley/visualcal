import path from 'path';
import { serverListenPort, files } from '../common/global-window-info';
import { ipcRenderer } from 'electron';
import { isDev } from '../main/utils/is-dev-mode';
import fs from 'fs';
import { RendererProcedureManager } from './managers/RendererProcedureManager';
import { IpcChannels, DemoUser } from '../@types/constants';
import { RendererSessionManager } from './managers/RendererSessionManager';
import { browserUtils } from './utils/browser-utils';
import { RendererResultManager } from './managers/RendererResultManager';
import { RendererActionManager } from './managers/RendererActionManager';

const dirs: VisualCalAugmentDirs = ipcRenderer.sendSync(IpcChannels.getDirs);

window.visualCal = {
  browserUtils: browserUtils,
  isMac: process.platform === 'darwin',
  isDev: isDev(),
  user: DemoUser,
  electron: {
    ipc: ipcRenderer,
    getVisualCalWindowId: () => ipcRenderer.send('get-visualcal-window-id-req'),
    showWindow: (windowId: VisualCalWindow) => ipcRenderer.send('show-window', windowId),
    showViewSessionWindow: (sessionName: string) => ipcRenderer.send('show-view-session-window', sessionName)
  },
  config: {
    httpServer: {
      port: serverListenPort
    }
  },
  dirs: dirs,
  files: files,
  log: {
    result: (result: LogicResult) => ipcRenderer.send(IpcChannels.log.result, result),
    info: (msg: any) => ipcRenderer.send(IpcChannels.log.info, msg),
    warn: (msg: any) => ipcRenderer.send(IpcChannels.log.warn, msg),
    error: (msg: any) => ipcRenderer.send(IpcChannels.log.error, msg)
  },
  procedureManager: new RendererProcedureManager(),
  sessionManager: new RendererSessionManager(),
  resultsManager: new RendererResultManager(),
  actionManager: new RendererActionManager(),
  assets: {
    basePath: path.resolve(dirs.public),
    get: (name: string) => fs.readFileSync(path.resolve(dirs.public, name))
  }
};
