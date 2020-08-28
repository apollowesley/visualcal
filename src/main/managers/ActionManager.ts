import { EventEmitter } from 'events';
import { ipcMain } from 'electron';
import { IpcChannels } from '../../constants';
import { RuntimeNode as IndySoftActionStartRuntimeNode, TriggerOptions } from '../../nodes/indysoft-action-start-types';
import NodeRed from '../node-red';
import { loadCommunicationConfiguration } from '../node-red/utils';

const nodeRed = NodeRed();

export class ActionManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on(IpcChannels.actions.start.request, async (event, opts: TriggerOptions) => {
      try {
        await this.start(opts);
        event.reply(IpcChannels.actions.start.response);
      } catch (error) {
        event.reply(IpcChannels.actions.start.error, { opts: opts, err: error });
      }
    });

    ipcMain.on(IpcChannels.actions.stop.request, (event, opts: TriggerOptions) => {
      try {
        this.stop(opts);
        event.reply(IpcChannels.actions.stop.response);
      } catch (error) {
        event.reply(IpcChannels.actions.stop.error, { opts: opts, err: error });
      }
    });
  }

  async start(opts: TriggerOptions) {
    if (!opts.session) throw new Error('A session is required to start and action trigger');
    loadCommunicationConfiguration(opts.session);
    nodeRed.startVisualCalActionStartNode(opts.section, opts.action);
  }

  stop(opts: TriggerOptions) {
    nodeRed.stopVisualCalActionStartNode(opts.section, opts.action);
  }

  stateChanged(node: IndySoftActionStartRuntimeNode, state: ActionState) {
    setImmediate(() => {
      if (!node.section) throw new Error(`indysoft-action-start node section property is not defined for node ${node.id}`);
      ipcMain.sendToAll(IpcChannels.actions.stateChanged, { section: node.section.name, action: node.name, state: state });
    });
  }

  handleResult(result: LogicResult) {
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.actions.resultAcquired, { result });
    });
  }

}
