import { EventEmitter } from 'events';
import { trigger } from '../node-red/utils/actions';
import { ipcMain } from 'electron';
import { IpcChannels } from '../../@types/constants';

export class ActionManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on(IpcChannels.actions.start.request, (event, opts: TriggerOptions) => {
      try {
        const result = this.start(opts);
        event.reply(IpcChannels.actions.start.response, result);
      } catch (error) {
        event.reply(IpcChannels.actions.start.error, error);
      }
    });
  }

  start(opts: TriggerOptions) {
    const result = trigger(opts);
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  }

}
