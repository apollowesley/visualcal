import * as fs from 'fs';
import path from 'path';
import { create as createLogger } from './logging/CreateLogger';
import { WindowManager } from './managers/WindowManager';
import NodeRedSettings from './node-red-settings';
import { getAll } from '../main/utils/Procedures';
import { ipcRenderer } from 'electron';
import { isDev } from './utils/is-dev-mode';
import { serverListenPort, dirs, publicPath } from '../common/global-window-info';

export const visualCal: VisualCalGlobalAugment = {
  logger: createLogger(),
  isMac: process.platform === 'darwin',
  isDev: isDev(),
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
  },
  windowManager: new WindowManager()
};

global.visualCal = visualCal;
NodeRedSettings.functionGlobalContext.visualCal = global.visualCal;
