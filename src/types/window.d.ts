interface Window {
  electron: {
    ipcRenderer: import('electron').IpcRenderer;
  };
  moment: typeof import('moment');
  visualCal: {
    ipc: import('electron').IpcRenderer,
    log: {
      result(result: LogicResult): void;
    }
  };
}
