import * as path from 'path';
import * as os from 'os';

// const levels = ['', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'];

const settings = {
  uiHost: 'localhost',    // only allow local connections, remove if you want to allow external access
  httpAdminRoot: '/red',  // set to false to disable editor and deploy
  httpNodeRoot: '/',
  userDir: path.join(os.homedir(), '.visualcal', 'logic'),
  flowFile: 'flows.json',
  editorTheme: {
    projects: { enabled: false },
    palette: { editable: true },
    page: {
      css: path.join(__dirname, '..', '..', 'node_modules/@node-red-contrib-themes/midnight-red/theme.css')
    }
  },
  nodesDir: path.join(__dirname, '..', '..', 'nodes'),
  functionGlobalContext: {
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
