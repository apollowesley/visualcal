import * as fs from 'fs';
import path from 'path';
import { create as createLogger } from './logging/CreateLogger';
import { WindowManager } from './managers/WindowManager';
import NodeRedSettings from './node-red-settings';
import { getAll } from '../main/utils/Procedures';
import { ipcRenderer } from 'electron';
import { isDev } from './utils/is-dev-mode';
import { serverListenPort, dirs, publicPath, files, procedures } from '../common/global-window-info';

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
  files: files,
  log: {
    result(result: LogicResult) {
      ipcRenderer.send('node-red', result);
    }
  },
  procedures: procedures,
  assets: {
    basePath: path.resolve(publicPath),
    get: (name: string) => fs.readFileSync(path.resolve(publicPath, name))
  },
  windowManager: new WindowManager()
};

global.visualCal = visualCal;
NodeRedSettings.functionGlobalContext.visualCal = global.visualCal;
