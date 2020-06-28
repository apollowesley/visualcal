import isDev from 'electron-is-dev';
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import { create as createLogger } from './logging/CreateLogger';
import { WindowManager } from './managers/WindowManager';
import NodeRedSettings from './node-red-settings';
import { getAll } from '../main/utils/Procedures';
import { browserUtils } from '../renderers/utils/browser-utils';
import { ipcRenderer } from 'electron';

const basePath = path.resolve(__dirname, '..', '..'); // <base>/dist
const publicPath = path.join(basePath, 'public');
const distPath = path.resolve(basePath, 'dist');

const serverListenPort = 18880;
const vueListenPort = isDev ? 8080 : serverListenPort;

export const visualCal: VisualCalGlobal = {
  logger: createLogger(),
  isMac: process.platform === 'darwin',
  isDev: isDev,
  config: {
    httpServer: {
      port: serverListenPort
    }
  },
  dirs: {
    base: basePath,
    html: {
      getWindowInfo: (id: VisualCalWindow) => {
        let windowPath = '';
        switch (id) {
          case VisualCalWindow.Console:
            windowPath = `http://localhost:${vueListenPort}/windows/console`;
            break;
          case VisualCalWindow.Loading:
            windowPath = `http://localhost:${vueListenPort}/windows/loading`;
            break;
          case VisualCalWindow.Login:
            windowPath = `http://localhost:${vueListenPort}/windows/login`;
            break;
          case VisualCalWindow.Main:
            windowPath = `http://localhost:${vueListenPort}/windows/main`;
            break;
          case VisualCalWindow.NodeRedEditor:
            windowPath = 'http://localhost:18880/red'
            break;
        }
        return {
          id: id,
          path: windowPath,
          type: WindowPathType.Url
        };
      },
      vue: path.resolve(distPath, 'renderer'),
      css: path.resolve(publicPath, 'css'),
      fonts: path.resolve(publicPath, 'fonts'),
      js: path.resolve(publicPath, 'js'),
      views: path.resolve(publicPath, 'views'),
      windows: path.resolve(publicPath, 'windows'),
      bootstrapStudio: path.resolve(basePath, 'bootstrap-studio', 'exported')
    },
    renderers: {
      base: path.resolve(distPath, 'renderers'),
      views: path.resolve(distPath, 'renderers', 'views'),
      windows: path.resolve(distPath, 'renderers', 'windows'),
      nodeBrowser: path.resolve(distPath, 'renderers', 'node-browser')
    },
    procedures: path.join(os.homedir(), '.visualcal', 'procedures'),
    visualCalUser: path.join(os.homedir(), '.visualcal')
  },
  log: {
    result(result: LogicResult) {
      ipcRenderer.send('node-red', result);
    }
  },
  browserUtils: browserUtils,
  electron: {
    ipc: ipcRenderer,
    getVisualCalWindowId: () => ipcRenderer.send('get-visualcal-window-id-req')
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
