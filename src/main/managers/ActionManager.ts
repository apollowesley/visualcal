import { ipcMain } from 'electron';
import { ActionState, IpcChannels, VisualCalWindow } from '../../constants';
import { RuntimeNode as IndySoftActionStartRuntimeNode, TriggerOptions } from '../../nodes/indysoft-action-start-types';
import NodeRed from '../node-red';
import { loadDevices } from '../node-red/utils';
import { DeviceManager } from './DeviceManager';
import { BeforeWriteStringResult } from '../../drivers/devices/Device';
import { UserManager } from './UserManager';
import { WindowManager } from './WindowManager';
import { RunManager } from './RunManager';
import { TypedEmitter } from 'tiny-typed-emitter';

interface Events {
  actionStarted: (opts: StartOptions) => void;
  actionStopped: (opts: StopOptions) => void;
}

export interface StartOptions {
  sectionId: string;
  actionId: string;
  runDescription?: string;
  session: Session;
  interceptDeviceWrites?: boolean;
  deviceConfig?: CommunicationInterfaceDeviceNodeConfiguration[];
}

export interface StopOptions {
  runId: string;
}

const nodeRed = NodeRed();

export class ActionManager extends TypedEmitter<Events> {

  private fUserManager: UserManager

  constructor(userManager: UserManager) {
    super();
    this.fUserManager = userManager;
    ipcMain.on(IpcChannels.actions.start.request, async (event, opts: StartOptions) => {
      try {
        const run = await this.start(opts);
        event.reply(IpcChannels.actions.start.response, run.id);
      } catch (error) {
        event.reply(IpcChannels.actions.start.error, { opts: opts, err: error });
      }
    });

    ipcMain.on(IpcChannels.actions.stop.request, async (event, opts: StopOptions) => {
      try {
        await this.stop(opts);
        event.reply(IpcChannels.actions.stop.response);
      } catch (error) {
        event.reply(IpcChannels.actions.stop.error, { opts: opts, err: error });
      }
    });
  }

  async start(opts: StartOptions) {
    const run = RunManager.instance.startRun(opts.session.name, opts.sectionId, opts.actionId);
    await global.visualCal.communicationInterfaceManager.loadFromSession(opts.session);
    loadDevices(opts.session);
    if (opts.interceptDeviceWrites) {
      for (const device of DeviceManager.instance.devices) {
        device.once('writeCancelled', async () => await this.stop({ runId: run.id }));
        device.onBeforeWriteString = async (device, iface, data) => {
          return new Promise<BeforeWriteStringResult>(async (resolve, reject) => {
            ipcMain.once(IpcChannels.device.beforeWriteString.response, (_, args: { data: string }) => {
              WindowManager.instance.close(VisualCalWindow.DeviceBeforeWrite);
              return resolve(args);
            });
            ipcMain.once(IpcChannels.device.beforeWriteString.error, (_, error: Error) => {
              WindowManager.instance.close(VisualCalWindow.DeviceBeforeWrite);
              return reject(error);
            });
            ipcMain.once(IpcChannels.device.beforeWriteString.cancel, (_, args: { data: string, cancel: boolean }) => {
              WindowManager.instance.close(VisualCalWindow.DeviceBeforeWrite);
              return resolve(args);
            });
            const deviceBeforeWriteWindow = await WindowManager.instance.showDeviceBeforeWriteWindow();
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
    nodeRed.startVisualCalActionStartNode(opts.sectionId, opts.actionId, run.id);
    this.emit('actionStarted', opts);
    return run;
  }

  async stop(opts: StopOptions) {
    for (const device of DeviceManager.instance.devices) {
      device.onBeforeWriteString = undefined;
    }
    await global.visualCal.communicationInterfaceManager.disconnectAll();
    if (!opts) return;
    const run = RunManager.instance.getOne(opts.runId);
    if (!run) return;
    nodeRed.stopVisualCalActionStartNode(run.sectionId, run.actionId);
    RunManager.instance.stopRun(opts.runId);
    this.emit('actionStopped', opts);
  }

  stateChanged(node: IndySoftActionStartRuntimeNode, state: ActionState, opts?: StopOptions) {
    setImmediate(async () => {
      if (!node.section) throw new Error(`indysoft-action-start node section property is not defined for node ${node.id}`);
      if (state === 'stopped' && opts) await this.stop(opts);
      ipcMain.sendToAll(IpcChannels.actions.stateChanged, { section: node.section.name, action: node.name, state: state });
    });
  }

}
