import * as path from 'path';
import * as os from 'os';
import type { Settings } from '../@types/logic-server';
import { findNodeById, findNodesByType, getActionNodesForSection, getAllNodes, getCommunicationInterfaceForDevice, getDriverForDevice, getNodeConfig, getProcedureStatus, getSectionNodes, onComment, resetConnectedInstructionNodes, resetAllConnectedNodes } from './node-red/utils';

// const levels = ['', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'];

const settings: Settings = {
  driversRoot: '',
  findNodeById: findNodeById,
  findNodesByType: findNodesByType,
  getActionNodesForSection: getActionNodesForSection,
  getAllNodes: getAllNodes,
  getCommunicationInterfaceForDevice: getCommunicationInterfaceForDevice,
  getDriverForDevice: getDriverForDevice,
  getNodeConfig: getNodeConfig,
  getProcedureStatus: getProcedureStatus,
  getSectionNodes: getSectionNodes,
  onComment: onComment,
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
    }
  },
  nodesDir: path.resolve(__dirname, '..', 'nodes'),
  functionGlobalContext: {
    indySoftLogicServerVersion: '0.1.0',
    visualCal: global.visualCal
  },    // enables global context - add extras here if you need them
  logging: {
    console: {
      level: 'info',
      metrics: false,
      audit: true
    },
    websock: {
      level: 'info',
      metrics: false
      // handler: function () {
      //   return function (msg: any) {
      //     var ts = (new Date(msg.timestamp)).toISOString();
      //     ts = ts.replace('Z', ' ').replace('T', ' ');
      //     // var line = '';
      //     // if (msg.type && msg.id) {
      //     //   line = ts + ' : [' + levels[msg.level / 10] + '] [' + msg.type + ':' + msg.id + '] ' + msg.msg;
      //     // }
      //     // else {
      //     //   line = ts + ' : [' + levels[msg.level / 10] + '] ' + msg.msg;
      //     // }
      //     // logBuffer.push(line);
      //     // if (conWindow && !conWindow.isDestroyed) { conWindow.webContents.send('debugMsg', line); }
      //     // if (logBuffer.length > logLength) { logBuffer.shift(); }
      //   }
      // }
    }
  }
};

export default settings;
