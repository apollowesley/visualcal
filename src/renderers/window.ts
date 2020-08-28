import { serverListenPort } from '../common/global-window-info';
import { ipcRenderer, SaveDialogOptions, OpenDialogOptions } from 'electron';
import { isDev } from '../main/utils/is-dev-mode';
import { RendererProcedureManager } from './managers/RendererProcedureManager';
import { IpcChannels } from '../constants';
import { RendererSessionManager } from './managers/RendererSessionManager';
import { browserUtils } from './utils/browser-utils';
import { RendererResultManager } from './managers/RendererResultManager';
import { RendererActionManager } from './managers/RendererActionManager';
import { RendererAssetManager } from './managers/RendererAssetManager';
import { RendererUserManager } from './managers/RendererUserManager';
import { CommunicationInterfaceManager } from './managers/CommunicationInterfaceManager';
import electronIpcLog from 'electron-ipc-log';
import { removeDesignTimeFromAllElements } from './utils/runtime';
import electronLog from 'electron-log';

electronLog.transports.file.level = 'debug';
electronLog.transports.console.level = 'debug';

const log = electronLog.scope('renderers/window.js');

// Removes all design-time helpers
removeDesignTimeFromAllElements();

ipcRenderer.on('testing', (_, value) => alert(value));

electronIpcLog((event: ElectronIpcLogEvent) => {
  var { channel, data, sent, sync } = event;
  var args = [sent ? 'sent' : 'received', channel, ...data];
  if (sync) args.unshift('ipc:sync');
  else args.unshift('ipc');
  log.info(...args);
});

window.visualCal = {
  browserUtils: browserUtils,
  isMac: process.platform === 'darwin',
  isDev: isDev(),
  electron: {
    ipc: ipcRenderer,
    getVisualCalWindowId: () => ipcRenderer.send(IpcChannels.windows.getMyId.request),
    showWindow: (id: VisualCalWindow) => ipcRenderer.send(IpcChannels.windows.show, id),
    showViewSessionWindow: (sessionName: string) => ipcRenderer.send(IpcChannels.windows.showViewSession, sessionName),
    showErrorDialog: (error: Error) => ipcRenderer.send(IpcChannels.windows.showErrorDialog, error),
    showCreateCommIfaceWindow: (sessionName: string) => ipcRenderer.send(IpcChannels.windows.showCreateCommIface, sessionName),
    showOpenFileDialog: (opts: OpenDialogOptions) => ipcRenderer.send(IpcChannels.windows.showOpenFileDialog.request, opts),
    showSaveFileDialog: (opts: SaveDialogOptions) => ipcRenderer.send(IpcChannels.windows.showSaveFileDialog.request, opts),
    quit: () => ipcRenderer.send(IpcChannels.application.quit.request)
  },
  config: {
    httpServer: {
      port: serverListenPort
    }
  },
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
  assetManager: new RendererAssetManager(),
  userManager: new RendererUserManager(),
  communicationInterfaceManager: new CommunicationInterfaceManager()
};
