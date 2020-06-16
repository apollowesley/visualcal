import { BrowserWindow } from 'electron';
import path from 'path';

export interface Options {
  parent?: BrowserWindow;
}

export const create = async (opts: Options) => {
  const window = new BrowserWindow({
    parent: opts.parent,
    center: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  await window.loadFile(path.join(global.visualCal.dirs.html, 'login.html'));
  return window;
}

export default create;
