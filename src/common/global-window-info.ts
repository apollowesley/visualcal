import * as os from 'os';
import path from 'path';
import { isDev } from '../main/utils/is-dev-mode';
import * as procedureUtils from '../main/utils/Procedures'

export const serverListenPort = 18880;
export const vueListenPort = isDev() ? 8080 : serverListenPort;

export const basePath = path.resolve(__dirname, '..', '..'); // <base>/dist
export const publicPath = path.join(basePath, 'public');
export const distPath = path.resolve(basePath, 'dist');

export const dirs: VisualCalAugmentDirs = {
  base: basePath,
  html: {
    getWindowInfo: (id: VisualCalWindow) => {
      let windowPath = '';
      switch (id) {
        case VisualCalWindow.Console:
          windowPath = `http://localhost:${vueListenPort}/windows/console`;
          break;
        case VisualCalWindow.Loading:
          windowPath = `http://localhost:${vueListenPort}/windows/loading`;
          break;
        case VisualCalWindow.Login:
          windowPath = `http://localhost:${vueListenPort}/windows/login`;
          break;
        case VisualCalWindow.Main:
          windowPath = `http://localhost:${vueListenPort}/windows/main`;
          break;
        case VisualCalWindow.NodeRedEditor:
          windowPath = 'http://localhost:18880/red'
          break;
      }
      return {
        id: id,
        path: windowPath,
        type: WindowPathType.Url
      };
    },
    vue: path.resolve(distPath, 'renderer'),
    css: path.resolve(publicPath, 'css'),
    fonts: path.resolve(publicPath, 'fonts'),
    js: path.resolve(publicPath, 'js'),
    views: path.resolve(publicPath, 'views'),
    windows: path.resolve(publicPath, 'windows'),
    bootstrapStudio: path.resolve(basePath, 'bootstrap-studio', 'exported')
  },
  renderers: {
    base: path.resolve(distPath, 'renderers'),
    views: path.resolve(distPath, 'renderers', 'views'),
    windows: path.resolve(distPath, 'renderers', 'windows'),
    nodeBrowser: path.resolve(distPath, 'renderers', 'node-browser')
  },
  procedures: path.join(os.homedir(), '.visualcal', 'procedures'),
  visualCalUser: path.join(os.homedir(), '.visualcal')
};

export const files: VisualCalAugmentFiles = {
  proceduresJson: path.join(dirs.procedures, 'procedures.json')
}

export const procedures: VisualCalAugmentProcedures = {
  create: procedureUtils.create,
  exists: procedureUtils.exists,
  getOne: procedureUtils.getOne,
  getAll: procedureUtils.getAll,
  remove: procedureUtils.remove,
  rename: procedureUtils.rename,
  getActive: procedureUtils.getActive,
  setActive: procedureUtils.setActive
}
