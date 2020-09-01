import * as path from 'path';
import * as os from 'os';
import type { Settings } from '../@types/logic-server';
import { findNodeById, findNodesByType, getAllNodes, getCommunicationInterfaceForDevice, getDriverForDevice, getNodeConfig, getProcedureStatus, onComment, resetConnectedInstructionNodes, resetAllConnectedNodes } from './node-red/utils';
import electronLog from 'electron-log';

const log = electronLog.scope('node-red');

// const levels = ['', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'];

const settings: Settings = {
  driversRoot: '',
  findNodeById: findNodeById,
  findNodesByType: findNodesByType,
  getAllNodes: getAllNodes,
  getCommunicationInterfaceForDevice: getCommunicationInterfaceForDevice,
  getDriverForDevice: getDriverForDevice,
  getNodeConfig: getNodeConfig,
  getProcedureStatus: getProcedureStatus,
  onComment: onComment,
  credentialSecret: 'IndySoft#927',
  resetAllConnectedInstructionNodes: resetConnectedInstructionNodes,
  resetAllConnectedNodes: resetAllConnectedNodes,
  paletteCategories: ['Actions', 'User', 'Results', 'Digital Multimeter', 'Multi Product Calibrator', 'Bulk Operations', 'subflows', 'common', 'function', 'network', 'sequence', 'parser', 'storage'],
  httpAdminRoot: '/red',  // set to false to disable editor and deploy
  httpNodeRoot: '/',
  userDir: path.join(os.homedir(), '.visualcal', 'logic'),
  flowFile: 'flows.json',
  editorTheme: {
    projects: { enabled: false },
    palette: { editable: true },
    page: {
      title: 'VisualCal Logic Editor',
      css: path.resolve(__dirname, '..', '..', 'node_modules', '@node-red-contrib-themes', 'midnight-red', 'theme.css')
    },
    header: {
      title: 'VisualCal - Logic Editor',
      url: 'https://www.indysoft.com/assets/img/indysoft-logo_wht.svg'
    }
  },
  nodesDir: path.resolve(__dirname, '..', 'nodes'),
  functionGlobalContext: {
    indySoftLogicServerVersion: '0.1.0',
    visualCal: global.visualCal
  },    // enables global context - add extras here if you need them
  logging: {
    electronLog: {
      level: 'debug',
      metrics: false,
      audit: false,
      handler: function() {
        return function(entry) {
          // entry = { timestamp: number; level: number; msg: any; }
          // entry.level === 50 === info
          // entry.level === 50 === debug
          switch (entry.level) {
            case 40: // info
              log.info('info ›', entry.msg);
              break;
            case 50: // debug
              log.debug('debug ›', entry.msg);
              break;
            default:
              log.warn('unknown log level (default) ›', entry.msg);
          }
        };
      }
    }
  }
};

export default settings;
