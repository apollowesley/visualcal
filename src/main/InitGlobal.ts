import * as RED from 'node-red';
import NodeRedSettings from './node-red-settings';
import { isDev, isMac } from './utils';
import { init as globalWindowInfoInit, serverListenPort, dirs, files } from '../common/global-window-info';
import { ProcedureManager } from './managers/ProcedureManager';
import { SessionManager } from './managers/SessionManager';
import { NodeRed } from '../@types/logic-server';
import { ActionManager } from './managers/ActionManager';
import { UserInteractionManager } from './managers/UserInteractionManager';
import { AssetManager } from './managers/AssetManager';
import { UserManager } from './managers/UserManager';
import { CommunicationInterfaceManager } from './managers/CommunicationInterfaceManager';
import electronLog from 'electron-log';
import { LogicResult } from 'visualcal-common/dist/result';

const log = electronLog.scope('VisualCal');

export const init = (baseAppDirPath: string, userHomeDataDirPath: string) => {
  globalWindowInfoInit(baseAppDirPath, userHomeDataDirPath);
  const localDirs = dirs();
  const localFiles = files();
  const userManager = new UserManager();

  global.visualCal = {
    logger: log,
    isMac: isMac(),
    isDev: isDev(),
    nodeRed: {
      app: RED as NodeRed
    },
    config: {
      httpServer: {
        port: serverListenPort
      }
    },
    dirs: localDirs,
    files: localFiles,
    log: {
      result: (result: LogicResult<string, number>) => log.info('result', result),
      info: (msg: any) => log.info(msg),
      warn: (msg: any) => log.warn(msg),
      error: (msg: any) => log.error(msg)
    },
    procedureManager: new ProcedureManager(localDirs.userHomeData.procedures),
    sessionManager: new SessionManager(userManager),
    actionManager: new ActionManager(userManager),
    userInteractionManager: new UserInteractionManager(),
    assetManager: new AssetManager(),
    userManager: userManager,
    communicationInterfaceManager: new CommunicationInterfaceManager()
  };

  NodeRedSettings.functionGlobalContext.visualCal = global.visualCal;
}
