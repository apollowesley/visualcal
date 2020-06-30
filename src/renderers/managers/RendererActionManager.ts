import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../@types/constants';

export class RendererActionManager extends EventEmitter {

  constructor() {
    super();
  }

  start(opts: TriggerOptions) {
    ipcRenderer.send(IpcChannels.actions.start.request, opts);
  }

}
