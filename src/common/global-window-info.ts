import * as os from 'os';
import path from 'path';
import { isDev } from '../main/utils/is-dev-mode';
import { ProcedureManager } from '../main/managers/ProcedureManager'

export const serverListenPort = 18880;
export const vueListenPort = isDev() ? 8080 : serverListenPort;

export const basePath = path.resolve(__dirname, '..', '..'); // <base>/dist
export const publicPath = path.join(basePath, 'public');
export const distPath = path.join(basePath, 'dist');
export const renderersPath = path.join(distPath, 'renderers');
export const renderersWindowsPath = path.join(renderersPath, 'windows');
export const renderersProcedurePath = path.join(renderersWindowsPath, 'procedure');
export const bootstrapStudioPath = path.join(basePath, 'bootstrap-studio', 'exported');

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
    vue: path.join(distPath, 'renderer'),
    css: path.join(publicPath, 'css'),
    fonts: path.join(publicPath, 'fonts'),
    js: path.join(publicPath, 'js'),
    views: path.join(publicPath, 'views'),
    windows: path.join(publicPath, 'windows'),
    bootstrapStudio: bootstrapStudioPath,
    procedure: {
      create: path.join(bootstrapStudioPath, 'procedure-create.html'),
      edit: path.join(bootstrapStudioPath, 'procedure-edit.html'),
      remove: path.join(bootstrapStudioPath, 'procedure-remove.html')
    }
  },
  renderers: {
    base: renderersPath,
    views: path.join(renderersPath, 'views'),
    windows: path.join(renderersPath, 'windows'),
    nodeBrowser: path.join(renderersPath, 'node-browser'),
    procedure: {
      create: path.join(renderersProcedurePath, 'create.js'),
      edit: path.join(renderersProcedurePath, 'edit.js'),
      remove: path.join(renderersProcedurePath, 'remove.js')
    }
  },
  procedures: path.join(os.homedir(), '.visualcal', 'procedures'),
  visualCalUser: path.join(os.homedir(), '.visualcal')
};

export const files: VisualCalAugmentFiles = {
  proceduresJson: path.join(dirs.procedures, 'procedures.json')
}
