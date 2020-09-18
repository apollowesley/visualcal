import { BrowserWindowConstructorOptions } from 'electron';
import { defaultFormat } from 'moment';
import path from 'path';
import { VisualCalWindow } from '../../../constants';

const renderersBaseDirPath = path.join(__dirname, '..', '..', '..', 'renderers');
const renderersVueBaseDirPath = path.join(renderersBaseDirPath, 'vue');
const preloadFilePath = path.join(renderersVueBaseDirPath, 'preload.js')

export const createVueWindow = async () => {
  await Promise.resolve();
}

export const defaultWindowConstructorOptions = {
  show: false,
  title: 'VisualCal',
  webPreferences: {
    nodeIntegration: false,
    preload: preloadFilePath
  }
}

export const setWindowSize = (windowId: VisualCalWindow, opts?: BrowserWindowConstructorOptions) => {
  if (!opts) return opts;
  switch (windowId) {
    case VisualCalWindow.Login:
      opts.height = 600;
      opts.width = 800;
  }
}

export const coerceWindowConstructorOptions = (opts: BrowserWindowConstructorOptions) => {
  opts.show = false;
  if (opts.webPreferences) {
    opts.webPreferences.nodeIntegration = false;
    opts.webPreferences.preload = preloadFilePath;
  }
  return opts;
}

export const defaultOptions = {
  
}