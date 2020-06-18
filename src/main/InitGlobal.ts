import isDev from 'electron-is-dev';
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import { create as createLogger } from './logging/CreateLogger';
import { WindowManager } from './managers/WindowManager';
import NodeRedSettings from './node-red-settings';

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
    html: path.resolve(__dirname, '..', '..', 'public'),
    renderers: path.resolve(__dirname, '..', 'renderers'),
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
