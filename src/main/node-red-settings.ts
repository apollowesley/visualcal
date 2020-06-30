import * as path from 'path';
import * as os from 'os';
import type { Settings } from '../@types/logic-server';

// const levels = ['', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'];

const settings: Settings = {
  disableAllCommunicationInterfaces: () => {},
  driversRoot: '',
  enableAllCommunicationInterfaces: () => {},
  findNodeById: () => undefined,
  findNodesByType: () => [],
  getActionNodesForSection: () => [],
  getAllNodes: () => [],
  getCommunicationInterface: () => undefined,
  getCommunicationInterfaceForDevice: () => undefined,
  getDriverForDevice: async () => null,
  getNodeConfig: () => undefined,
  getProcedureStatus: () => null,
  getSectionNodes: () => [],
  onActionResult: () => {},
  onActionStateChange: () => {},
  onComment: () => {},
  onGetUserInput: () => undefined,
  onShowInstruction: () => undefined,
  resetAllConnectedInstructionNodes: () => undefined,
  resetAllConnectedNodes: () => undefined,

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
  },    // enables global context - add extras ehre if you need them
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
