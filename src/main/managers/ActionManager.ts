import { ipcMain } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { LogicRun } from 'visualcal-common/dist/result';
import { IpcChannels, VisualCalWindow } from '../../constants';
import { CustomDriverNodeRedRuntimeNode, findCustomDriverConfigRuntimeNode } from '../../nodes/indysoft-custom-driver-types';
// import { BeforeWriteStringResult } from '../../drivers/devices/Device';
import { CommunicationInterfaceManager } from './CommunicationInterfaceManager';
import { CancelActionReason, CustomDriverConfigurationNodeEditorDefinition, NodeRedManager } from './NodeRedManager';
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
        await this.cancel(CancelActionReason.user, 'User clicked stop button');
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
    await CommunicationInterfaceManager.instance.loadFromSession(opts.session);
    NodeRedManager.instance.utils.loadDevices(opts.session);
    // TODO: Implmenet interceptDeviceWrites for Custom Drivers
    if (opts.interceptDeviceWrites) {
      const customDriverNodes = NodeRedManager.instance.findTypedNodesByType<CustomDriverConfigurationNodeEditorDefinition, CustomDriverNodeRedRuntimeNode>('indysoft-custom-driver');
      for (const customDriverNode of customDriverNodes) {
        customDriverNode.runtime.onBeforeWrite = (data) => {
          return new Promise(async (resolve, reject) => {
            if (typeof data !== 'string') return resolve({ data });
            ipcMain.once(IpcChannels.device.beforeWriteString.response, (_, args: { data: string }) => {
              if (WindowManager.instance.isWindowLoaded(VisualCalWindow.DeviceBeforeWrite)) WindowManager.instance.close(VisualCalWindow.DeviceBeforeWrite);
              return resolve(args);
            });
            ipcMain.once(IpcChannels.device.beforeWriteString.error, (_, error: Error) => {
              if (WindowManager.instance.isWindowLoaded(VisualCalWindow.DeviceBeforeWrite)) WindowManager.instance.close(VisualCalWindow.DeviceBeforeWrite);
              return reject(error);
            });
            ipcMain.once(IpcChannels.device.beforeWriteString.cancel, async (_, args: { data: string, cancel: boolean }) => {
              if (WindowManager.instance.isWindowLoaded(VisualCalWindow.DeviceBeforeWrite)) WindowManager.instance.close(VisualCalWindow.DeviceBeforeWrite);
              await this.stop();
              return resolve(args);
            });
            const deviceBeforeWriteWindow = await WindowManager.instance.showDeviceBeforeWriteWindow();
            const driverConfig = findCustomDriverConfigRuntimeNode(customDriverNode.runtime);
            if (driverConfig) {
              const commInterface = NodeRedManager.instance.utils.getCommunicationInterfaceForDevice(driverConfig.unitId);
              if (commInterface) {
                deviceBeforeWriteWindow.webContents.send(IpcChannels.device.beforeWriteString.request, { deviceName: driverConfig?.unitId, ifaceName: commInterface.name, data });
              }
            }
          });
        }
      };
    }
    if (opts.deviceConfig) {
      const interfaceNames = opts.deviceConfig.map(c => c.interfaceName);
      this.fUserManager.setDeviceConfigs(opts.session.username, opts.session.name, opts.deviceConfig);
      await CommunicationInterfaceManager.instance.connectAll(interfaceNames);
    } else {
      await CommunicationInterfaceManager.instance.connectAll();
    }
    await NodeRedManager.instance.startAction(opts.sectionId, opts.actionId, this.fCurrentRun.id);
    this.emit('actionStarted', opts);
    ipcMain.sendToAll(IpcChannels.actions.stateChanged, { section: opts.sectionId, action: opts.actionId, state: 'started' });
    return this.fCurrentRun;
  }

  private endCurrentRun(isCompleted = true) {
    if (!this.currentRun) return;
    RunManager.instance.stopRun(this.currentRun, isCompleted);
    this.emit('actionStopped', this.currentRun.id);
    this.fCurrentRun = undefined;
  }

  async stop() {
    await NodeRedManager.instance.stopCurrentAction();
    if (this.currentRun && this.currentRun.sectionId && this.currentRun.actionId) {
      const section = this.currentRun.sectionId;
      const action = this.currentRun.actionId;
      setImmediate(() => ipcMain.sendToAll(IpcChannels.actions.stateChanged, { section: section, action: action, state: 'stopped' }));
    }
    this.endCurrentRun(true);
  }

  async cancel(reason: CancelActionReason, reasonText?: string) {
    await NodeRedManager.instance.cancelCurrentAction(reason, reasonText);
    if (this.currentRun && this.currentRun.sectionId && this.currentRun.actionId) {
      const section = this.currentRun.sectionId;
      const action = this.currentRun.actionId;
      setImmediate(() => ipcMain.sendToAll(IpcChannels.actions.stateChanged, { section: section, action: action, state: 'stopped' }));
    }
    this.endCurrentRun(false);
  }

  async complete() {
    if (this.currentRun && this.currentRun.sectionId && this.currentRun.actionId) {
      ipcMain.sendToAll(IpcChannels.actions.stateChanged, { section: this.currentRun.sectionId, action: this.currentRun.actionId, state: 'completed' });
    }
    await this.stop();
  }

}
