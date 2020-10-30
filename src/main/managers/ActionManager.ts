import { ipcMain } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { LogicRun } from 'visualcal-common/dist/result';
import { ActionState, IpcChannels, VisualCalWindow } from '../../constants';
import { BeforeWriteStringResult } from '../../drivers/devices/Device';
import { RuntimeNode as IndySoftActionStartRuntimeNode } from '../../nodes/indysoft-action-start-types';
import { loadDevices } from '../node-red/utils';
import { DeviceManager } from './DeviceManager';
import { NodeRedManager } from './NodeRedManager';
import { RunManager } from './RunManager';
import { UserManager } from './UserManager';
import { WindowManager } from './WindowManager';

export interface StartOptions {
  sectionId: string;
  actionId: string;
  runDescription?: string;
  session: Session;
  interceptDeviceWrites?: boolean;
  deviceConfig?: CommunicationInterfaceDeviceNodeConfiguration[];
}

interface Events {
  actionStarted: (opts: StartOptions) => void;
  actionStopped: (runId: string) => void;
}

export class ActionManager extends TypedEmitter<Events> {

  private fUserManager: UserManager
  private fCurrentRun?: LogicRun<string, number>;

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

    ipcMain.on(IpcChannels.actions.stop.request, async (event) => {
      try {
        await this.stop();
        event.reply(IpcChannels.actions.stop.response);
      } catch (error) {
        event.reply(IpcChannels.actions.stop.error, { err: error });
      }
    });
  }

  get isRunning() { return this.fCurrentRun !== undefined; }
  get currentRun() { return this.fCurrentRun; }

  async start(opts: StartOptions) {
    this.fCurrentRun = RunManager.instance.startRun(opts.session.name, opts.sectionId, opts.actionId, opts.runDescription);
    await global.visualCal.communicationInterfaceManager.loadFromSession(opts.session);
    loadDevices(opts.session);
    if (opts.interceptDeviceWrites) {
      for (const device of DeviceManager.instance.devices) {
        device.once('writeCancelled', async () => await this.stop());
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
    await NodeRedManager.instance.startAction(opts.sectionId, opts.actionId, this.fCurrentRun.id);
    this.emit('actionStarted', opts);
    ipcMain.sendToAll(IpcChannels.actions.stateChanged, { section: opts.sectionId, action: opts.actionId, state: 'started' });
    return this.fCurrentRun;
  }

  async stop() {
    await NodeRedManager.instance.stopCurrentAction();
    await global.visualCal.communicationInterfaceManager.disconnectAll();
    for (const device of DeviceManager.instance.devices) {
      device.onBeforeWriteString = undefined;
    }
    if (!this.currentRun) return;
    if (this.currentRun.sectionId && this.currentRun.actionId) {
      ipcMain.sendToAll(IpcChannels.actions.stateChanged, { section: this.currentRun.sectionId, action: this.currentRun.actionId, state: 'stopped' });
    }
    RunManager.instance.stopRun(this.currentRun);
    this.emit('actionStopped', this.currentRun.id);
    this.fCurrentRun = undefined;
  }

  async complete() {
    if (this.currentRun && this.currentRun.sectionId && this.currentRun.actionId) {
      ipcMain.sendToAll(IpcChannels.actions.stateChanged, { section: this.currentRun.sectionId, action: this.currentRun.actionId, state: 'completed' });
    }
    await this.stop();
  }

}
