import { ipcRenderer } from 'electron';
import { getAll } from '../main/utils/Procedures';
import path from 'path';
import os from 'os';
import { browserUtils } from './utils/browser-utils';

const baseDir = path.resolve(__dirname, '..', '..', '..'); // <base>/dist

const visualCal: VisualCalRenderer = {
  browserUtils: browserUtils,
  electron: {
    ipc: ipcRenderer,
    getVisualCalWindowId: () => ipcRenderer.send('get-visualcal-window-id-req')
  },
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
  dirs: {
    base: baseDir, 
    html: {
      css: path.resolve(baseDir,'public', 'css'),
      fonts: path.resolve(baseDir, '..','public', 'fonts'),
      js: path.resolve(baseDir, '..','public', 'js'),
      views: path.resolve(baseDir, '..','public', 'views'),
      windows: path.resolve(baseDir, '..','public', 'windows')
    },
    renderers: {
      base: path.resolve(baseDir,'renderers'),
      views: path.resolve(baseDir,'renderers', 'views'),
      windows: path.resolve(baseDir,'renderers', 'windows'),
      nodeBrowser: path.resolve(baseDir,'renderers', 'node-browser')
    },
    procedures: path.join(os.homedir(), '.visualcal', 'procedures'),
    visualCalUser: path.join(os.homedir(), '.visualcal')
  }
}

window.visualCal = visualCal;
