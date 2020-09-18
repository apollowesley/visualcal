import * as RED from 'node-red';
import { WindowManager } from './managers/WindowManager';
import NodeRedSettings from './node-red-settings';
import { isDev } from './utils/is-dev-mode';
import { init as globalWindowInfoInit, serverListenPort, dirs, files } from '../common/global-window-info';
import { ProcedureManager } from './managers/ProcedureManager';
import { SessionManager } from './managers/SessionManager';
import { NodeRed } from '../@types/logic-server';
import { ResultManager } from './managers/ResultManager';
import { ActionManager } from './managers/ActionManager';
import { UserInteractionManager } from './managers/UserInteractionManager';
import { AssetManager } from './managers/AssetManager';
import { UserManager } from './managers/UserManager';
import { CommunicationInterfaceManager } from './managers/CommunicationInterfaceManager';
import electronLog from 'electron-log';

const log = electronLog.scope('VisualCal');

export const init = (baseAppDirPath: string, userHomeDataDirPath: string) => {
  globalWindowInfoInit(baseAppDirPath, userHomeDataDirPath);
  const localDirs = dirs();
  const localFiles = files();
  const userManager = new UserManager();

  global.visualCal = {
    logger: log,
    isMac: process.platform === 'darwin',
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
      result: (result: LogicResult) => log.info('result', result),
      info: (msg: any) => log.info(msg),
      warn: (msg: any) => log.warn(msg),
      error: (msg: any) => log.error(msg)
    },
    windowManager: new WindowManager(),
    procedureManager: new ProcedureManager(localDirs.userHomeData.procedures),
    sessionManager: new SessionManager(userManager),
    resultManager: new ResultManager(),
    actionManager: new ActionManager(userManager),
    userInteractionManager: new UserInteractionManager(),
    assetManager: new AssetManager(),
    userManager: userManager,
    communicationInterfaceManager: new CommunicationInterfaceManager()
  };

  NodeRedSettings.functionGlobalContext.visualCal = global.visualCal;
}
