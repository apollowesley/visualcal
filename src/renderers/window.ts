import { serverListenPort } from '../common/global-window-info';
import { ipcRenderer } from 'electron';
import { isDev } from '../main/utils/is-dev-mode';
import { RendererProcedureManager } from './managers/RendererProcedureManager';
import { IpcChannels, DemoUser } from '../@types/constants';
import { RendererSessionManager } from './managers/RendererSessionManager';
import { browserUtils } from './utils/browser-utils';
import { RendererResultManager } from './managers/RendererResultManager';
import { RendererActionManager } from './managers/RendererActionManager';
import { RendererAssetManager } from './managers/RendererAssetManager';
import { RendererUserManager } from './managers/RendererUserManager';
import { CommunicationInterfaceManager } from './managers/CommunicationInterfaceManager';
import electronIpcLog from 'electron-ipc-log';

electronIpcLog((event: ElectronIpcLogEvent) => {
  var { channel, data, sent, sync } = event;
  var args = [sent ? '⬆️' : '⬇️', channel, ...data];
  if (sync) args.unshift('ipc:sync');
  else args.unshift('ipc');
  console.info(...args);
});

window.visualCal = {
  browserUtils: browserUtils,
  isMac: process.platform === 'darwin',
  isDev: isDev(),
  electron: {
    ipc: ipcRenderer,
    getVisualCalWindowId: () => ipcRenderer.send('get-visualcal-window-id-req'),
    showWindow: (windowId: VisualCalWindow) => ipcRenderer.send('show-window', windowId),
    showViewSessionWindow: (sessionName: string) => ipcRenderer.send('show-view-session-window', sessionName),
    showErrorDialog: (error: Error) => ipcRenderer.send(IpcChannels.windows.showErrorDialog, error),
    showCreateCommIfaceWindow: (sessionName: string) => ipcRenderer.send(IpcChannels.windows.showCreateCommIface, sessionName)
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
