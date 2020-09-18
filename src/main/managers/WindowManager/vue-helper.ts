import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import path from 'path';
import { VisualCalWindow } from '../../../constants';
import { isDev } from '../../utils/is-dev-mode';
import * as WindowUtils from '../../utils/Window';

const renderersBaseDirPath = path.join(__dirname, '..', '..', '..', 'renderers');
const renderersVueBaseDirPath = path.join(renderersBaseDirPath, 'vue');
const preloadFilePath = path.join(renderersVueBaseDirPath, 'preload.js')

const defaultWindowConstructorOptions = {
  show: false,
  title: 'VisualCal',
  webPreferences: {
    nodeIntegration: false,
    preload: preloadFilePath
  }
}

const setWindowSize = (windowId: VisualCalWindow, opts?: BrowserWindowConstructorOptions) => {
  if (!opts) return opts;
  switch (windowId) {
    case VisualCalWindow.Login:
      opts.height = 600;
      opts.width = 800;
      break;
  }
}

export const getSubPath = (windowId: VisualCalWindow) => {
  switch (windowId) {
    case VisualCalWindow.Login:
      return '/login';
  }
  return '/';
}

const coerceWindowConstructorOptions = (opts: BrowserWindowConstructorOptions) => {
  opts.show = false;
  if (opts.webPreferences) {
    opts.webPreferences.nodeIntegration = false;
    opts.webPreferences.preload = preloadFilePath;
  }
  return opts;
}

export const showWindow = async (id: VisualCalWindow, opts: { subPath?: string; maximize?: boolean; windowOpts?: BrowserWindowConstructorOptions; } = { maximize: true, windowOpts: defaultWindowConstructorOptions }) => {
  return new Promise<BrowserWindow>(async (resolve, reject) => {
    if (global.visualCal.windowManager.isWindowLoaded(id)) return reject('Already opened');
    if (opts && !opts.windowOpts) {
      opts.windowOpts = defaultWindowConstructorOptions;
    } else if (opts && opts.windowOpts) {
      opts.windowOpts = coerceWindowConstructorOptions(opts.windowOpts);
    } else {
      opts = { windowOpts: defaultWindowConstructorOptions }
    }
    try {
      const vueWindow = new BrowserWindow(opts.windowOpts);
      setWindowSize(id);
      vueWindow.visualCal = { id: id };
      global.visualCal.windowManager.add(vueWindow);
      vueWindow.webContents.once('did-finish-load' , async () => {
        WindowUtils.centerWindowOnNearestCurorScreen(vueWindow, opts.maximize);
        if (opts.maximize) {
          vueWindow.maximize();
        }
        vueWindow.show();
        vueWindow.focus();
        return resolve(vueWindow);
      });
      let url = isDev() ? 'http://127.0.0.1:8080' : 'http://127.0.0.1:18880/vue';
      if (opts && opts.subPath) url = `${url}${opts.subPath}`;
      await vueWindow.loadURL(url);
    } catch (error) {
      return reject(error);
    }
  });
}
