import * as path from 'path';

const levels = ['', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'];

const settings = {
    readOnly: true,
    uiHost: 'localhost',    // only allow local connections, remove if you want to allow external access
    httpAdminRoot: '/red',  // set to false to disable editor and deploy
    httpNodeRoot: '/',
    userDir: path.join(__dirname, '..', '..'),
    flowFile: path.join(__dirname, '..', '..', 'electronflow.json'),
    editorTheme: { projects: { enabled: false }, palette: { editable: true } },    // enable projects feature
    functionGlobalContext: {},    // enables global context - add extras ehre if you need them
    logging: {
      console: {
        level: 'info',
        metrics: false,
        audit: true
      },
      websock: {
        level: 'info',
        metrics: false,
        handler: function() {
          return function(msg: any) {
            var ts = (new Date(msg.timestamp)).toISOString();
            ts = ts.replace('Z', ' ').replace('T', ' ');
            var line = '';
            if (msg.type && msg.id) {
              line = ts + ' : [' + levels[msg.level / 10] + '] [' + msg.type + ':' + msg.id + '] ' + msg.msg;
            }
            else {
              line = ts + ' : [' + levels[msg.level / 10] + '] ' + msg.msg;
            }
            // logBuffer.push(line);
            // if (conWindow && !conWindow.isDestroyed) { conWindow.webContents.send('debugMsg', line); }
            // if (logBuffer.length > logLength) { logBuffer.shift(); }
          }
        }
      }
    }
  };

export default settings;
