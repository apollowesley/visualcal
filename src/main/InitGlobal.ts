import isDev from 'electron-is-dev';
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import { create as createLogger } from './logging/CreateLogger';
import { WindowManager } from './managers/WindowManager';
import NodeRedSettings from './node-red-settings';
import { VisualCalWindow, WindowPathType } from 'src/types/enums';

global.visualCal = {
  logger: createLogger(),
  isMac: process.platform === 'darwin',
  isDev: isDev,
  config: {
    httpServer: {
      port: 18880
    }
  },
  dirs: {
    base: path.resolve(__dirname, '..', '..'), // <base>/dist
    html: {
      getWindowInfo: (id: VisualCalWindow) => {
        let windowPath = '';
        switch (id) {
          case VisualCalWindow.Console:
            windowPath = 'http://localhost:8080?window=console';
            break;
          case VisualCalWindow.Loading:
            windowPath = 'http://localhost:8080?window=loading';
            break;
          case VisualCalWindow.Login:
            windowPath = 'http://localhost:8080?window=login';
            break;
          case VisualCalWindow.Main:
            windowPath = 'http://localhost:8080?window=main';
            break;
          case VisualCalWindow.NodeRedEditor:
            windowPath = 'http://localhost:8080?window=node-red-editor';
            break;
        }
        return {
          id: id,
          path: windowPath,
          type: WindowPathType.Url
        };
      },
      css: path.resolve(__dirname, '..', '..', 'public', 'css'),
      fonts: path.resolve(__dirname, '..', '..', 'public', 'fonts'),
      js: path.resolve(__dirname, '..', '..', 'public', 'js'),
      views: path.resolve(__dirname, '..', '..', 'public', 'views'),
      windows: path.resolve(__dirname, '..', '..', 'public', 'windows')
    },
    renderers: {
      views: path.resolve(__dirname, '..', 'renderers', 'views'),
      windows: path.resolve(__dirname, '..', 'renderers', 'windows')
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
