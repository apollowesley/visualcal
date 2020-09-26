import { BrowserWindowConstructorOptions } from 'electron';
import path from 'path';
import { VisualCalWindow } from '../../../constants';
import { isDev } from '../../utils';

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
  opts.titleBarStyle = 'hidden';
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
    case VisualCalWindow.UpdateApp:
      return 'VisualCal Update';
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
    case VisualCalWindow.UpdateApp:
      return '/auto-update';
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
