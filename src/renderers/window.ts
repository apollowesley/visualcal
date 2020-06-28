import path from 'path';
import { serverListenPort, dirs, publicPath } from '../common/global-window-info';
import { ipcRenderer } from 'electron';
import { isDev } from '../main/utils/is-dev-mode';
import { getAll } from '../main/utils/Procedures';
import fs from 'fs';

window.visualCal = {
  isMac: process.platform === 'darwin',
  isDev: isDev(),
  electron: {
    ipc: ipcRenderer,
    getVisualCalWindowId: () => ipcRenderer.send('get-visualcal-window-id-req')
  },
  config: {
    httpServer: {
      port: serverListenPort
    }
  },
  dirs: dirs,
  log: {
    result(result: LogicResult) {
      ipcRenderer.send('node-red', result);
    }
  },
  procedures: {
    create: async (info: CreateProcedureInfo) => await Promise.resolve({ name: info.name, shortName: info.shortName || info.name }),
    exists: async (name: string) => await Promise.resolve(true),
    getOne: async (name: string) => await Promise.resolve(undefined),
    getAll: getAll,
    remove: async (name: string) => await Promise.resolve(),
    rename: async (oldName: string, newName: string) => await Promise.resolve()
  },
  assets: {
    basePath: path.resolve(publicPath),
    get: (name: string) => fs.readFileSync(path.resolve(publicPath, name))
  }
};
