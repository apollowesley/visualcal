import { EventEmitter } from 'events';
import { ipcMain } from 'electron';
import { ActionState, IpcChannels, VisualCalWindow } from '../../constants';
import { RuntimeNode as IndySoftActionStartRuntimeNode, TriggerOptions } from '../../nodes/indysoft-action-start-types';
import NodeRed from '../node-red';
import { loadDevices } from '../node-red/utils';
import { DeviceManager } from './DeviceManager';
import { BeforeWriteStringResult } from '../../drivers/devices/Device';
import { UserManager } from './UserManager';

const nodeRed = NodeRed();

export class ActionManager extends EventEmitter {

  private fUserManager: UserManager

  constructor(userManager: UserManager) {
    super();
    this.fUserManager = userManager;
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
    if (opts.interceptDeviceWrites) {
      for (const device of DeviceManager.instance.devices) {
        device.once('writeCancelled', async () => await this.stop(opts));
        device.onBeforeWriteString = async (device, iface, data) => {
          return new Promise<BeforeWriteStringResult>(async (resolve, reject) => {
            ipcMain.once(IpcChannels.device.beforeWriteString.response, (_, args: { data: string }) => {
              global.visualCal.windowManager.close(VisualCalWindow.DeviceBeforeWrite);
              return resolve(args);
            });
            ipcMain.once(IpcChannels.device.beforeWriteString.error, (_, error: Error) => {
              global.visualCal.windowManager.close(VisualCalWindow.DeviceBeforeWrite);
              return reject(error);
            });
            ipcMain.once(IpcChannels.device.beforeWriteString.cancel, (_, args: { data: string, cancel: boolean }) => {
              global.visualCal.windowManager.close(VisualCalWindow.DeviceBeforeWrite);
              return resolve(args);
            });
            const deviceBeforeWriteWindow = await global.visualCal.windowManager.showDeviceBeforeWriteWindow();
            deviceBeforeWriteWindow.webContents.send(IpcChannels.device.beforeWriteString.request, { deviceName: device.name, ifaceName: iface.name, data });
          });
        }
      }
    }
    if (opts.deviceConfig) {
      const interfaceNames = opts.deviceConfig.map(c => c.interfaceName);
      this.fUserManager.setDeviceConfigs(opts.session.username, opts.session.name, opts.deviceConfig);
      await global.visualCal.communicationInterfaceManager.connectAll(interfaceNames);
    } else {
      await global.visualCal.communicationInterfaceManager.connectAll();
    }
    nodeRed.startVisualCalActionStartNode(opts.section, opts.action, opts.runId);
  }

  async stop(opts: TriggerOptions) {
    for (const device of DeviceManager.instance.devices) {
      device.onBeforeWriteString = undefined;
    }
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
