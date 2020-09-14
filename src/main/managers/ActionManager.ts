import { EventEmitter } from 'events';
import { ipcMain } from 'electron';
import { ActionState, IpcChannels } from '../../constants';
import { RuntimeNode as IndySoftActionStartRuntimeNode, TriggerOptions } from '../../nodes/indysoft-action-start-types';
import NodeRed from '../node-red';
import { loadDevices } from '../node-red/utils';

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

    ipcMain.on(IpcChannels.actions.stop.request, async (event, opts: TriggerOptions) => {
      try {
        await this.stop(opts);
        event.reply(IpcChannels.actions.stop.response);
      } catch (error) {
        event.reply(IpcChannels.actions.stop.error, { opts: opts, err: error });
      }
    });
  }

  async start(opts: TriggerOptions) {
    if (!opts.session) throw new Error('A session is required to start and action trigger');
    await global.visualCal.communicationInterfaceManager.loadFromSession(opts.session);
    loadDevices(opts.session);
    await global.visualCal.communicationInterfaceManager.connectAll();
    nodeRed.startVisualCalActionStartNode(opts.section, opts.action, opts.runId);
  }

  async stop(opts: TriggerOptions) {
    await global.visualCal.communicationInterfaceManager.disconnectAll();
    nodeRed.stopVisualCalActionStartNode(opts.section, opts.action);
  }

  stateChanged(node: IndySoftActionStartRuntimeNode, state: ActionState, opts?: TriggerOptions) {
    setImmediate(async () => {
      if (!node.section) throw new Error(`indysoft-action-start node section property is not defined for node ${node.id}`);
      if (state === 'stopped' && opts) await this.stop(opts);
      ipcMain.sendToAll(IpcChannels.actions.stateChanged, { section: node.section.name, action: node.name, state: state });
    });
  }

  handleResult(result: LogicResult) {
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.actions.resultAcquired, { result });
      const activeSession = global.visualCal.userManager.activeSession;
      if (activeSession) global.visualCal.resultManager.saveOne(activeSession.name, result);
    });
  }

}
