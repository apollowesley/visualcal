import { EventEmitter } from 'events';
import { trigger, TriggerOptions } from '../node-red/utils/actions';
import { ipcMain } from 'electron';
import { IpcChannels } from '../../@types/constants';
import { ActionStartRuntimeNode } from '../../@types/logic-server';

export class ActionManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on(IpcChannels.actions.trigger.request, (event, opts: TriggerOptions) => {
      try {
        const result = this.trigger(opts);
        event.reply(IpcChannels.actions.trigger.response, result);
      } catch (error) {
        event.reply(IpcChannels.actions.trigger.error, { opts: opts, err: error });
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

  stateChanged(node: ActionStartRuntimeNode, state: ActionState) {
    setImmediate(() => {
      if (!node.section) throw new Error(`indysoft-action-start node section property is not defined for node ${node.id}`);
      global.visualCal.windowManager.sendToAll(IpcChannels.actions.stateChanged, { section: node.section.name, action: node.name, state: state });
    });
  }

  handleResult(result: LogicResult) {
    setImmediate(() => {
      global.visualCal.windowManager.sendToAll(IpcChannels.actions.resultAcquired, { result });
    });
  }

}
