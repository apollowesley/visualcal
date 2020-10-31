import { isDev, isMac } from './utils';
import { init as globalWindowInfoInit, serverListenPort, dirs, files } from '../common/global-window-info';
import { ProcedureManager } from './managers/ProcedureManager';
import { SessionManager } from './managers/SessionManager';
import { ActionManager } from './managers/ActionManager';
import { UserInteractionManager } from './managers/UserInteractionManager';
import { AssetManager } from './managers/AssetManager';
import { UserManager } from './managers/UserManager';
import electronLog from 'electron-log';

const log = electronLog.scope('global (PLEASE REMOVE)');

export const init = (baseAppDirPath: string, userHomeDataDirPath: string) => {
  globalWindowInfoInit(baseAppDirPath, userHomeDataDirPath);
  const localDirs = dirs();
  const localFiles = files();
  const userManager = new UserManager();

  global.visualCal = {
    isMac: isMac(),
    isDev: isDev(),
    config: {
      httpServer: {
        port: serverListenPort
      }
    },
    dirs: localDirs,
    files: localFiles,
    log: {
      info: (msg: any) => log.info(msg),
      warn: (msg: any) => log.warn(msg),
      error: (msg: any) => log.error(msg)
    },
    procedureManager: new ProcedureManager(localDirs.userHomeData.procedures),
    sessionManager: new SessionManager(userManager),
    actionManager: new ActionManager(userManager),
    userInteractionManager: new UserInteractionManager(),
    assetManager: new AssetManager(),
    userManager: userManager
  };

}
