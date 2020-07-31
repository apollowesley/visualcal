import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../constants';

export interface ResponseArgs {
  sessionName: string;
}

export interface LoadResponseArgs extends ResponseArgs {
  results: LogicResult[];
}

export interface SaveResponseArgs extends ResponseArgs {
  results: LogicResult[];
}

export interface SaveOneResponseArgs extends ResponseArgs {
  result: LogicResult;
}

export class RendererResultManager extends EventEmitter {

  constructor() {
    super();
    ipcRenderer.on(IpcChannels.results.load.response, (_, sessionName: string, results: LogicResult[]) => { this.emit(IpcChannels.results.load.response, { sessionName, results }); });
    ipcRenderer.on(IpcChannels.results.load.error, (event, error: Error) => { this.emit(IpcChannels.results.load.error, { event, error }); });

    ipcRenderer.on(IpcChannels.results.save.response, (_, sessionName: string, results: LogicResult[]) => { this.emit(IpcChannels.results.save.response, { sessionName, results }); });
    ipcRenderer.on(IpcChannels.results.save.error, (event, error: Error) => { this.emit(IpcChannels.results.save.error, { event, error }); });

    ipcRenderer.on(IpcChannels.results.saveOne.response, (_, sessionName: string, result: LogicResult) => { this.emit(IpcChannels.results.saveOne.response, { sessionName, result }); });
    ipcRenderer.on(IpcChannels.results.saveOne.error, (event, error: Error) => { this.emit(IpcChannels.results.saveOne.error, { event, error }); });
  }

  load(sessionName: string) {
    ipcRenderer.send(IpcChannels.results.load.request, sessionName);
  }

  save(sessionName: string, results: LogicResult[]) {
    ipcRenderer.send(IpcChannels.results.save.request, sessionName, results);
  }

  saveOne(sessionName: string, result: LogicResult) {
    ipcRenderer.send(IpcChannels.results.saveOne.request, sessionName, result);
  }

}
