import { ipcRenderer } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { LogicRun, LogicResult, IpcChannels, LogicRunBasicInfo } from 'visualcal-common/dist/result';

interface Events {
  runStarted: (run: LogicRun<string, number>) => void;
  runStopped: (runId: string) => void;
  resultAdded: (result: LogicResult<string, number>) => void;
}

export class RendererRunManager extends TypedEmitter<Events> {

  constructor() {
    super();
    ipcRenderer.on(IpcChannels.runStarted, (_, run: LogicRun<string, number>) => { this.emit('runStarted', run); });
    ipcRenderer.on(IpcChannels.runStopped, (_, runId: string) => { this.emit('runStopped', runId); });
    ipcRenderer.on(IpcChannels.resultAdded, (_, result: LogicResult<string, number>) => { this.emit('resultAdded', result); });
  }

  async getAllBasicInfosForCurrentSession() {
    return new Promise<LogicRunBasicInfo[]>((resolve, reject) => {
      ipcRenderer.once(IpcChannels.getAllBasicInfosForCurrentSession.response, (_, results: LogicRunBasicInfo[]) => {
        ipcRenderer.removeAllListeners(IpcChannels.getAllBasicInfosForCurrentSession.error);
        return resolve(results);
      });
      ipcRenderer.once(IpcChannels.getAllBasicInfosForCurrentSession.error, (_, error: Error) => {
        ipcRenderer.removeAllListeners(IpcChannels.getAllBasicInfosForCurrentSession.response);
        return reject(error);
      });
      ipcRenderer.send(IpcChannels.getAllBasicInfosForCurrentSession.request);
    });
  }

  async getResultsForRun(runId: string) {
    return new Promise<LogicResult<string, number>[]>((resolve, reject) => {
      ipcRenderer.once(IpcChannels.getResultsForRun.response, (_, results: LogicResult<string, number>[]) => {
        ipcRenderer.removeAllListeners(IpcChannels.getResultsForRun.error);
        return resolve(results);
      });
      ipcRenderer.once(IpcChannels.getResultsForRun.error, (_, error: Error) => {
        ipcRenderer.removeAllListeners(IpcChannels.getResultsForRun.response);
        return reject(error);
      });
      ipcRenderer.send(IpcChannels.getResultsForRun.request, runId);
    });
  }

}
