import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../@types/constants';
import { TriggerOptions, TriggerResult } from '../../main/node-red/utils/actions';
import { TypedEmitter } from 'tiny-typed-emitter';

interface Events {
  triggerResponse: (result: TriggerResult) => void;
  triggerError: (info: { opts: TriggerOptions, err: Error }) => void;
  stateChanged: (info: { section: string, action: string, state: ActionState }) => void;
  resultAcquired: (info: { result: LogicResult }) => void;
}

export class RendererActionManager extends TypedEmitter<Events> {

  constructor() {
    super();
    ipcRenderer.on(IpcChannels.actions.trigger.response, (_, result: TriggerResult) => this.emit('triggerResponse', result));
    ipcRenderer.on(IpcChannels.actions.trigger.error, (_, info: { opts: TriggerOptions, err: Error }) => this.emit('triggerError', info));
    ipcRenderer.on(IpcChannels.actions.stateChanged, (_, info: { section: string, action: string, state: ActionState }) => this.emit('stateChanged', info));
    ipcRenderer.on(IpcChannels.actions.resultAcquired, (_, info: { result: LogicResult }) => this.emit('resultAcquired', info));
  }

  trigger(opts: TriggerOptions) {
    ipcRenderer.send(IpcChannels.actions.trigger.request, opts);
  }

}
