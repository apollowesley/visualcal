import isDev from 'electron-is-dev';
import path from 'path';
import os from 'os';
import fs from 'fs';

global.visualCal = {
  logs: {
    main: []
  },
  isMac: process.platform === 'darwin',
  isDev: isDev.valueOf(),
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
  }
};
