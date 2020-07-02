import path from 'path';
import  { getDirs } from './dirs';
import { isDev } from '../main/utils/is-dev-mode';

export const serverListenPort = 18880;
export const vueListenPort = isDev() ? 8080 : serverListenPort;

export let dirs: VisualCalAugmentDirs;
export let files: VisualCalAugmentFiles;

export const init = (appBaseDirPath: string, userHomeBaseDirPath: string) => {
  dirs = getDirs(appBaseDirPath, userHomeBaseDirPath);
  files = {
    proceduresJson: path.join(dirs.userHomeData.procedures, 'procedures.json'),
    sessionsJson: path.join(dirs.userHomeData.sessions, 'sessions.json')
  }
}
