import { ipcRenderer } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { SessionViewWindowOpenIPCInfo } from '../../../../@types/session-view';
import { IpcChannels } from '../../../../constants';
import { IpcChannels as BenchConfigIpcChannels, BenchConfig } from 'visualcal-common/dist/bench-configuration';

interface Events {
  mainLogEntry: (entry: any) => void;
  viewInfoReceived: (viewInfo: SessionViewWindowOpenIPCInfo) => void;
  benchConfigsUpdated: (configs: BenchConfig[]) => void;
}

export class IpcHandler extends TypedEmitter<Events> {

  constructor() {
    super();
    ipcRenderer.on(IpcChannels.session.viewInfo.response, (_, viewInfo: SessionViewWindowOpenIPCInfo) => this.emit('viewInfoReceived', viewInfo));
    this.initMainLogHandlers();
    this.initBenchConfigHandlers();
  }

  private initMainLogHandlers() {
    ipcRenderer.on(IpcChannels.log.all, async (_, entry: any) => {
      this.emit('mainLogEntry', entry);
    });
  }

  private initBenchConfigHandlers() {
    ipcRenderer.on(BenchConfigIpcChannels.Updated, (_, configs: BenchConfig[]) => {
      this.emit('benchConfigsUpdated', configs);
    });
  }

  async getViewInfo() {
    return new Promise<SessionViewWindowOpenIPCInfo>((resolve, reject) => {
      ipcRenderer.once(IpcChannels.session.viewInfo.response, (_, viewInfo: SessionViewWindowOpenIPCInfo) => resolve(viewInfo));
      ipcRenderer.once(IpcChannels.session.viewInfo.error, (_, error: Error) => reject(error));
      ipcRenderer.send(IpcChannels.session.viewInfo.request);
    });
  }

}
