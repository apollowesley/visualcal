import * as RED from 'node-red';
import { create as createLogger } from './logging/CreateLogger';
import { WindowManager } from './managers/WindowManager';
import NodeRedSettings from './node-red-settings';
import { isDev } from './utils/is-dev-mode';
import { init as globalWindowInfoInit, serverListenPort, dirs, files } from '../common/global-window-info';
import { ProcedureManager } from './managers/ProcedureManager';
import { SessionManager } from './managers/SessionManager';
import { NodeRed } from '../@types/logic-server';
import { NodeRedFlowManager } from './managers/NodeRedFlowManager';
import { ResultManager } from './managers/ResultManager';
import { ActionManager } from './managers/ActionManager';
import { UserInteractionManager } from './managers/UserInteractionManager';
import { AssetManager } from './managers/AssetManager';
import { LoginManager } from './managers/LoginManager';
import { UserManager } from './managers/UserManager';
import { CommunicationInterfaceManager } from './managers/CommunicationInterfaceManager';

export let visualCal: VisualCalGlobalAugment;
const windowManager = new WindowManager();

export const init = (baseAppDirPath: string, userHomeDataDirPath: string) => {
  globalWindowInfoInit(baseAppDirPath, userHomeDataDirPath);
  const localDirs = dirs();
  const localFiles = files();
  visualCal = {
    logger: createLogger(),
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
      result: (result: LogicResult) => global.visualCal.logger.info('result', result),
      info: (msg: any) => global.visualCal.logger.info(msg),
      warn: (msg: any) => global.visualCal.logger.warn(msg),
      error: (msg: any) => global.visualCal.logger.error(msg)
    },
    windowManager: windowManager,
    procedureManager: new ProcedureManager(localDirs.userHomeData.procedures),
    sessionManager: new SessionManager(localDirs.userHomeData.sessions),
    nodeRedFlowManager: new NodeRedFlowManager(),
    resultManager: new ResultManager(),
    actionManager: new ActionManager(),
    userInteractionManager: new UserInteractionManager(),
    assetManager: new AssetManager(),
    loginManager: new LoginManager(),
    userManager: new UserManager(),
    communicationInterfaceManager: new CommunicationInterfaceManager()
  };

  global.visualCal = visualCal;
  NodeRedSettings.functionGlobalContext.visualCal = global.visualCal;
}
