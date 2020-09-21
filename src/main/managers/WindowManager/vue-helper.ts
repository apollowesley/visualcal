import { BrowserWindowConstructorOptions } from 'electron';
import path from 'path';
import { VisualCalWindow } from '../../../constants';
import { isDev } from '../../utils/is-dev-mode';

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

export const setWindowSize = (_: VisualCalWindow, opts?: BrowserWindowConstructorOptions) => {
  if (!opts) return;
  opts.resizable = isDev();
  opts.maximizable = isDev();
  opts.height = 600;
  opts.width = 800;
  return opts;
}

export const getWindowTitle = (windowId: VisualCalWindow) => {
  switch (windowId) {
    case VisualCalWindow.Login:
      return 'VisualCal Login'
    case VisualCalWindow.SelectProcedure:
      return 'VisualCal Procedure Selection';
    case VisualCalWindow.SelectSession:
      return 'VisualCal Session Selection';
  }
  return 'VisualCal';
}

export const getSubPath = (windowId: VisualCalWindow) => {
  switch (windowId) {
    case VisualCalWindow.Login:
      return '/login';
    case VisualCalWindow.SelectProcedure:
      return '/procedure-select';
    case VisualCalWindow.SelectSession:
      return '/session-select';
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
