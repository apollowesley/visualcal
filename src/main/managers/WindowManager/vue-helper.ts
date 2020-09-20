import { BrowserWindowConstructorOptions } from 'electron';
import path from 'path';
import { VisualCalWindow } from '../../../constants';

const renderersBaseDirPath = path.join(__dirname, '..', '..', '..', 'renderers');
const renderersVueBaseDirPath = path.join(renderersBaseDirPath, 'vue');
const preloadFilePath = path.join(renderersVueBaseDirPath, 'preload.js')

export const defaultWindowConstructorOptions = {
  show: false,
  title: 'VisualCal',
  webPreferences: {
    nodeIntegration: false,
    preload: preloadFilePath
  }
}

export const setWindowSize = (windowId: VisualCalWindow, opts?: BrowserWindowConstructorOptions) => {
  if (!opts) return;
  switch (windowId) {
    case VisualCalWindow.Login:
      opts.resizable = false;
      opts.maximizable = false;
      opts.height = 600;
      opts.width = 800;
      break;
    case VisualCalWindow.SelectProcedure:
      opts.resizable = false;
      opts.maximizable = false;
      opts.height = 600;
      opts.width = 800;
      break;
  }
  return opts;
}

export const getWindowTitle = (windowId: VisualCalWindow) => {
  switch (windowId) {
    case VisualCalWindow.Login:
      return 'VisualCal Login'
    case VisualCalWindow.SelectProcedure:
      return 'VisualCal Procedure Selection';
  }
  return 'VisualCal';
}

export const getSubPath = (windowId: VisualCalWindow) => {
  switch (windowId) {
    case VisualCalWindow.Login:
      return '/login';
    case VisualCalWindow.SelectProcedure:
      return '/procedure-select';
  }
  return '/';
}

export const coerceWindowConstructorOptions = (windowId: VisualCalWindow, opts: BrowserWindowConstructorOptions) => {
  opts.show = false;
  opts.title = getWindowTitle(windowId);
  if (opts.webPreferences) {
    opts.webPreferences.nodeIntegration = false;
    opts.webPreferences.preload = preloadFilePath;
  }
  return opts;
}
