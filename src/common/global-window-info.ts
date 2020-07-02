import path from 'path';
import { init as initDirs, getDirs } from './dirs';
import { init as initFiles, getFiles } from './files';
import { isDev } from '../main/utils/is-dev-mode';

export const serverListenPort = 18880;
export const vueListenPort = isDev() ? 8080 : serverListenPort;

export const dirs = () => getDirs();
export const files = () => getFiles();

export const init = (appBaseDirPath: string, userHomeBaseDirPath: string) => {
  initDirs(appBaseDirPath, userHomeBaseDirPath);
  initFiles(getDirs());
}
