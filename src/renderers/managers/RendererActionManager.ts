import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../@types/constants';
import { TriggerOptions, TriggerResult } from '../../main/node-red/utils/actions';

export class RendererActionManager extends EventEmitter {

  constructor() {
    super();
    ipcRenderer.on(IpcChannels.actions.trigger.response, (_, result: TriggerResult) => { this.emit(IpcChannels.actions.trigger.response, result); });
    ipcRenderer.on(IpcChannels.actions.trigger.error, (_, error: Error) => { this.emit(IpcChannels.actions.trigger.error, error); });
  }

  trigger(opts: TriggerOptions) {
    ipcRenderer.send(IpcChannels.actions.trigger.request, opts);
  }

}
