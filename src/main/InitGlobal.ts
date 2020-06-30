import fs from 'fs';
import * as RED from 'node-red';
import path from 'path';
import { app } from 'electron';
import { create as createLogger } from './logging/CreateLogger';
import { WindowManager } from './managers/WindowManager';
import NodeRedSettings from './node-red-settings';
import { isDev } from './utils/is-dev-mode';
import { serverListenPort, dirs, publicPath, files } from '../common/global-window-info';
import { ProcedureManager } from './managers/ProcedureManager';
import { SessionManager } from './managers/SessionManager';
import { DemoUser } from '../@types/constants';
import { NodeRed } from '../@types/logic-server';
import { NodeRedFlowManager } from './managers/NodeRedFlowManager';

dirs.visualCalUser = path.join(app.getPath('documents'), 'IndySoft', 'VisualCal');
dirs.procedures = path.join(dirs.visualCalUser, 'procedures');
dirs.sessions = path.join(dirs.visualCalUser, 'sessions');

export const visualCal: VisualCalGlobalAugment = {
  logger: createLogger(),
  isMac: process.platform === 'darwin',
  isDev: isDev(),
  user: DemoUser,
  nodeRed: RED as NodeRed,
  config: {
    httpServer: {
      port: serverListenPort
    }
  },
  dirs: dirs,
  files: files,
  log: {
    result: (result: LogicResult) => global.visualCal.logger.info('result', result),
    info: (msg: any) => global.visualCal.logger.info(msg),
    warn: (msg: any) => global.visualCal.logger.warn(msg),
    error: (msg: any) => global.visualCal.logger.error(msg)
  },
  procedureManager: new ProcedureManager(dirs.procedures),
  sessionManager: new SessionManager(dirs.sessions),
  nodeRedFlowManager: new NodeRedFlowManager(),
  assets: {
    basePath: path.resolve(publicPath),
    get: (name: string) => fs.readFileSync(path.resolve(publicPath, name))
  },
  windowManager: new WindowManager()
};

global.visualCal = visualCal;
NodeRedSettings.functionGlobalContext.visualCal = global.visualCal;
