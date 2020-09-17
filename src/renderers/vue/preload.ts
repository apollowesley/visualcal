import { ipcRenderer } from 'electron';

(window as any).electron = {
  ipcRenderer: ipcRenderer
};
