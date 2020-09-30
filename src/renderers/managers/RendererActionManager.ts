import { ipcRenderer } from 'electron';
import { ActionState, IpcChannels } from '../../constants';
import { TypedEmitter } from 'tiny-typed-emitter';
import { TriggerOptions } from '../../nodes/indysoft-action-start-types';
import { StartOptions, StopOptions } from '../../main/managers/ActionManager';

export interface StateChangeInfo {
  state: ActionState;
  section: string;
  action: string;
}


interface Events {
  started: () => void;
  startError: (args: { opts: StartOptions, err: Error | string }) => void;
  stopped: () => void;
  stopError: (err: Error) => void;
  reset: () => void;
  resetError: (err: Error) => void;
  stateChanged: (info: StateChangeInfo) => void;
}

export class RendererActionManager extends TypedEmitter<Events> {

  constructor() {
    super();
    ipcRenderer.on(IpcChannels.actions.start.response, () => this.emit('started'));
    ipcRenderer.on(IpcChannels.actions.start.error, (_, args: { opts: StartOptions, err: Error | string }) => this.emit('startError', args));

    ipcRenderer.on(IpcChannels.actions.stop.response, () => this.emit('stopped'));
    ipcRenderer.on(IpcChannels.actions.stop.error, (_, err: Error) => this.emit('stopError', err));

    ipcRenderer.on(IpcChannels.actions.reset.response, () => this.emit('reset'));
    ipcRenderer.on(IpcChannels.actions.reset.error, (_, err: Error) => this.emit('resetError', err));

    ipcRenderer.on(IpcChannels.actions.stateChanged, (_, info: StateChangeInfo) => this.emit('stateChanged', info));
  }

  start(opts: StartOptions) {
    ipcRenderer.send(IpcChannels.actions.start.request, opts);
  }

  stop(opts: StopOptions) {
    ipcRenderer.send(IpcChannels.actions.stop.request, opts);
  }

  reset(opts: TriggerOptions) {
    ipcRenderer.send(IpcChannels.actions.reset.request, opts);
  }

}
