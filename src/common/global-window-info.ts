import { init as initDirs, getDirs } from './dirs';
import { init as initFiles, getFiles } from './files';

export const serverListenPort = 18880;

export const dirs = () => getDirs();
export const files = () => getFiles();

export const init = (appBaseDirPath: string, userHomeBaseDirPath: string) => {
  initDirs(appBaseDirPath, userHomeBaseDirPath);
  initFiles(getDirs());
}
