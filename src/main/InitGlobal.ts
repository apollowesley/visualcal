import fs from 'fs';
import * as RED from 'node-red';
import path from 'path';
import { create as createLogger } from './logging/CreateLogger';
import { WindowManager } from './managers/WindowManager';
import NodeRedSettings from './node-red-settings';
import { isDev } from './utils/is-dev-mode';
import { init as globalWindowInfoInit, serverListenPort, dirs, files } from '../common/global-window-info';
import { ProcedureManager } from './managers/ProcedureManager';
import { SessionManager } from './managers/SessionManager';
import { DemoUser } from '../@types/constants';
import { NodeRed } from '../@types/logic-server';
import { NodeRedFlowManager } from './managers/NodeRedFlowManager';
import { ResultManager } from './managers/ResultManager';
import { ActionManager } from './managers/ActionManager';
import { UserInteractionManager } from './managers/UserInteractionManager';
import { IpcManager } from './managers/IpcManager';

export let visualCal: VisualCalGlobalAugment;

export const init = (baseAppDirPath: string, userHomeDataDirPath: string) => {
  globalWindowInfoInit(baseAppDirPath, userHomeDataDirPath);
  const localDirs = dirs();
  const localFiles = files();
  visualCal = {
    logger: createLogger(),
    isMac: process.platform === 'darwin',
    isDev: isDev(),
    user: DemoUser,
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
    procedureManager: new ProcedureManager(localDirs.userHomeData.procedures),
    sessionManager: new SessionManager(localDirs.userHomeData.sessions),
    nodeRedFlowManager: new NodeRedFlowManager(),
    resultManager: new ResultManager(),
    actionManager: new ActionManager(),
    userInteractionManager: new UserInteractionManager(),
    ipcManager: new IpcManager(),
    assets: {
      basePath: dirs().public,
      get: (name: string) => fs.readFileSync(path.join(localDirs.public, name))
    },
    windowManager: new WindowManager()
  };

  global.visualCal = visualCal;
  NodeRedSettings.functionGlobalContext.visualCal = global.visualCal;
}
