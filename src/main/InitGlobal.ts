import isDev from 'electron-is-dev';
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import { create as createLogger } from './logging/CreateLogger';
import { WindowManager } from './managers/WindowManager';
import NodeRedSettings from './node-red-settings';

const serverListenPort = 18880;
const vueListenPort = isDev ? 8080 : serverListenPort;

global.visualCal = {
  logger: createLogger(),
  isMac: process.platform === 'darwin',
  isDev: isDev,
  config: {
    httpServer: {
      port: serverListenPort
    }
  },
  dirs: {
    base: path.resolve(__dirname, '..', '..'), // <base>/dist
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
      vue: path.resolve(__dirname, '..', 'renderer'),
      css: path.resolve(__dirname, '..', '..', 'public', 'css'),
      fonts: path.resolve(__dirname, '..', '..', 'public', 'fonts'),
      js: path.resolve(__dirname, '..', '..', 'public', 'js'),
      views: path.resolve(__dirname, '..', '..', 'public', 'views'),
      windows: path.resolve(__dirname, '..', '..', 'public', 'windows')
    },
    renderers: {
      base: path.resolve(__dirname, '..', 'renderers'),
      views: path.resolve(__dirname, '..', 'renderers', 'views'),
      windows: path.resolve(__dirname, '..', 'renderers', 'windows'),
      nodeBrowser: path.resolve(__dirname, '..', 'renderers', 'node-browser')
    },
    procedures: path.join(os.homedir(), '.visualcal', 'procedures'),
    visualCalUser: path.join(os.homedir(), '.visualcal')
  },
  assets: {
    basePath: path.resolve(__dirname, '..', '..', 'public'),
    get: (name: string) => fs.readFileSync(path.resolve(__dirname, '..', '..', 'public', name))
  },
  windowManager: new WindowManager()
};

NodeRedSettings.functionGlobalContext.visualCal = global.visualCal;
