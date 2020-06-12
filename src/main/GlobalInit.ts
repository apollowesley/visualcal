import isDev from 'electron-is-dev';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { WindowManager } from './managers/WindowManager';
import { create } from './logging/CreateLogger';

global.visualCal = {
  logger: create(),
  isMac: process.platform === 'darwin',
  isDev: isDev,
  config: {
    appIcon: path.join(__dirname, '..', '..', 'assets', 'app-icon.png'),
    httpServer: {
      port: 18880
    }
  },
  dirs: {
    base: path.join(__dirname, '..', '..'), // <base>/dist
    html: path.join(__dirname, '..', '..', 'html'),
    procedures: path.join(os.homedir(), '.visualcal', 'procedures'),
    visualCalUser: path.join(os.homedir(), '.visualcal')
  },
  assets: {
    basePath: path.join(__dirname, '..', '..', 'assets'),
    get: (name: string) => fs.readFileSync(path.join(__dirname, '..', '..', 'assets', name))
  },
  windowManager: new WindowManager()
};
