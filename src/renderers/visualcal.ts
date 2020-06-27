import { ipcRenderer } from 'electron';
import { getAll } from '../main/utils/Procedures';
import path from 'path';
import os from 'os';

window.visualCal = {
  ipc: ipcRenderer,
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
    base: path.resolve(__dirname, '..', '..', '..'), // <base>/dist
    html: {
      css: path.resolve(__dirname, '..', '..', '..', 'public', 'css'),
      fonts: path.resolve(__dirname, '..', '..', '..', 'public', 'fonts'),
      js: path.resolve(__dirname, '..', '..', '..', 'public', 'js'),
      views: path.resolve(__dirname, '..', '..', '..', 'public', 'views'),
      windows: path.resolve(__dirname, '..', '..', '..', 'public', 'windows')
    },
    renderers: {
      base: path.resolve(__dirname, '..', '..', 'renderers'),
      views: path.resolve(__dirname, '..', '..', 'renderers', 'views'),
      windows: path.resolve(__dirname, '..', '..', 'renderers', 'windows'),
      nodeBrowser: path.resolve(__dirname, '..', '..', 'renderers', 'node-browser')
    },
    procedures: path.join(os.homedir(), '.visualcal', 'procedures'),
    visualCalUser: path.join(os.homedir(), '.visualcal')
  }
}
