interface Window {
  moment: typeof import('moment'),
  visualCal: {
    ipc: import('electron').IpcRenderer,
    log: {
      result(result: LogicResult): void;
    }
  }
}
