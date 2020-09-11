import { EventEmitter } from 'events';
import { ipcMain } from 'electron';
import { IpcChannels } from '../../constants';
import { RuntimeNode as IndySoftActionStartRuntimeNode, TriggerOptions } from '../../nodes/indysoft-action-start-types';
import NodeRed from '../node-red';
import { loadCommunicationConfiguration } from '../node-red/utils';
import { Device } from '../../drivers/devices/Device';

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
    Device.devices.forEach(device => device.on('write', (_, data) => {
      ipcMain.sendToAll(IpcChannels.log.all, data);
    }));
    Device.devices.forEach(device => device.on('stringReceived', (_, data) => {
      ipcMain.sendToAll(IpcChannels.log.all, data);
    }));
    global.visualCal.communicationInterfaceManager.enableAll();
    await global.visualCal.communicationInterfaceManager.connectAll();
    nodeRed.startVisualCalActionStartNode(opts.section, opts.action, opts.runId);
  }

  stop(opts: TriggerOptions) {
    global.visualCal.communicationInterfaceManager.disconnectAll();
    global.visualCal.communicationInterfaceManager.disableAll();
    Device.devices.forEach(device => () => device.removeAllListeners('write'));
    Device.devices.forEach(device => () => device.removeAllListeners('stringReceived'));
    nodeRed.stopVisualCalActionStartNode(opts.section, opts.action);
  }

  stateChanged(node: IndySoftActionStartRuntimeNode, state: ActionState, opts?: TriggerOptions) {
    setImmediate(() => {
      if (!node.section) throw new Error(`indysoft-action-start node section property is not defined for node ${node.id}`);
      if (state === 'stopped' && opts) this.stop(opts);
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
