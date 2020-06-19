import { ipcRenderer } from 'electron';

export const test = (msg: string) => alert(msg);

window.visualCal = {
  ipc: ipcRenderer,
  log: {
    result(result: LogicResult) {
      ipcRenderer.send('node-red', result);
    }
  }
};
