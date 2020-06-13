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
    appIcon: path.resolve(__static, 'app-icon.png'),
    httpServer: {
      port: 18880
    }
  },
  dirs: {
    base: path.join(__dirname, '..', '..'), // <base>/dist
    html: path.resolve(__static),
    procedures: path.join(os.homedir(), '.visualcal', 'procedures'),
    visualCalUser: path.join(os.homedir(), '.visualcal')
  },
  assets: {
    basePath: path.resolve(__static),
    get: (name: string) => fs.readFileSync(path.resolve(__static, name))
  },
  windowManager: new WindowManager()
};
