import { EventEmitter } from 'events';
import { trigger, TriggerOptions } from '../node-red/utils/actions';
import { ipcMain } from 'electron';
import { IpcChannels } from '../../@types/constants';

export class ActionManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on(IpcChannels.actions.trigger.request, (event, opts: TriggerOptions) => {
      try {
        const result = this.trigger(opts);
        event.reply(IpcChannels.actions.trigger.response, result);
      } catch (error) {
        event.reply(IpcChannels.actions.trigger.error, error);
      }
    });
  }

  trigger(opts: TriggerOptions) {
    const result = trigger(opts);
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  }

}
