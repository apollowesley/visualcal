import { BrowserWindowConstructorOptions } from 'electron';
import path from 'path';
import { VisualCalWindow } from '../../../constants';
import { isDev } from '../../utils';

const renderersBaseDirPath = path.join(__dirname, '..', '..', '..', 'renderers');
const renderersVueBaseDirPath = path.join(renderersBaseDirPath, 'vue');
const preloadFilePath = path.join(renderersVueBaseDirPath, 'preload.js');

export const defaultWindowConstructorOptions = {
  show: false,
  title: 'VisualCal',
  webPreferences: {
    nodeIntegration: false,
    preload: preloadFilePath
  }
}

export const setWindowSize = (id: VisualCalWindow, opts?: BrowserWindowConstructorOptions) => {
  if (!opts) return undefined;
  opts.resizable = isDev();
  opts.maximizable = isDev();
  opts.height = 600;
  opts.width = 800;
  opts.titleBarStyle = isDev() ? 'default' : 'hidden';
  switch (id) {
    case VisualCalWindow.BenchConfigView:
      opts.resizable = undefined;
      opts.maximizable = undefined;
      opts.height = undefined;
      opts.width = undefined;
      opts.titleBarStyle = undefined;
    case VisualCalWindow.Results:
      opts.resizable = undefined;
      opts.maximizable = undefined;
      opts.height = undefined;
      opts.width = undefined;
      opts.titleBarStyle = undefined;
    case VisualCalWindow.DriverBuilder:
      opts.resizable = true;
      opts.maximizable = true;
      opts.height = undefined;
      opts.width = undefined;
      opts.titleBarStyle = undefined;
  }
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
    case VisualCalWindow.BenchConfigView:
      return 'VisualCal Bench Configuration';
    case VisualCalWindow.Results:
      return 'VisualCal Results';
    case VisualCalWindow.DriverBuilder:
      return 'VisualCal Driver Builder'
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
    case VisualCalWindow.BenchConfigView:
      return '/bench-config-editor';
    case VisualCalWindow.Results:
      return '/results';
    case VisualCalWindow.DriverBuilder:
      return '/driver-builder';
  }
  return '/';
}

export const coerceWindowConstructorOptions = (windowId: VisualCalWindow, opts: BrowserWindowConstructorOptions) => {
  opts.show = false;
  opts.title = getWindowTitle(windowId);
  if (opts.webPreferences) {
    opts.webPreferences.nodeIntegration = false;
    opts.webPreferences.preload = preloadFilePath;
    opts.webPreferences.devTools = true;
  } else {
    opts.webPreferences = {
      nodeIntegration: false,
      preload: preloadFilePath,
      devTools: true
    }
  }
  return opts;
}
