import { ipcMain } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { LogicRun } from 'visualcal-common/dist/result';
import { IpcChannels, VisualCalWindow } from '../../constants';
import { CustomDriverNodeRedRuntimeNode, findCustomDriverConfigRuntimeNode } from '../../nodes/indysoft-instrument-driver-types';
// import { BeforeWriteStringResult } from '../../drivers/devices/Device';
import { CommunicationInterfaceManager } from './CommunicationInterfaceManager';
import { DriverBuilder } from './DriverBuilder';
import { CancelActionReason, CustomDriverConfigurationNodeEditorDefinition, NodeRedManager } from './NodeRedManager';
import { RunManager } from './RunManager';
import { UserManager } from './UserManager';
import { WindowManager } from './WindowManager';
import electronLog from 'electron-log';

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

const log = electronLog.scope('ActionManager');

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

  async identifyAllIdentifiableDevices() {
    log.info('Identifying all instruments');
    const driverNodes = NodeRedManager.instance.allDriversNodes;
    if (!driverNodes || driverNodes.length <= 0) return;
    for (const node of driverNodes) {
      try {
        const driver = DriverBuilder.instance.getDriver(node.runtime.manufacturer, node.runtime.model);
        if (!driver) continue;
        const iface = NodeRedManager.instance.utils.getCommunicationInterfaceForDevice(node.runtime.unitId);
        if (!iface) continue;
        await CommunicationInterfaceManager.instance.setCurrentDeviceAddress(iface, node.runtime.unitId);
        let identityString = '';
        if (driver.identityQueryCommand) {
          // Let the optional custom identity query command take precedence
          identityString = await iface.queryString(driver.identityQueryCommand);
        } else if (driver.isGPIB || driver.isIEEE4882) {
          identityString = await iface.queryString('*IDN?');
        }
        const identityParts = identityString.split(',');
        log.info(identityParts);
      } catch (error) {
        log.error(error.message);
      }
    }
  }

  async start(opts: StartOptions) {
    this.fCurrentRun = RunManager.instance.startRun(opts.session.name, opts.sectionId, opts.actionId, opts.runDescription);
    await CommunicationInterfaceManager.instance.loadFromSession(opts.session);
    NodeRedManager.instance.utils.loadDevices(opts.session);
    // TODO: Implmenet interceptDeviceWrites for Custom Drivers
    if (opts.interceptDeviceWrites) {
      const customDriverNodes = NodeRedManager.instance.findTypedNodesByType<CustomDriverConfigurationNodeEditorDefinition, CustomDriverNodeRedRuntimeNode>('indysoft-instrument-driver');
      for (const customDriverNode of customDriverNodes) {
        customDriverNode.runtime.onBeforeWrite = (data) => {
          return new Promise(async (resolve, reject) => {
            if (typeof data !== 'string') return resolve({ data });
            ipcMain.once(IpcChannels.interceptWrite.response, (_, args: { data: string }) => {
              return resolve(args);
            });
            ipcMain.once(IpcChannels.interceptWrite.error, (_, error: Error) => {
              return reject(error);
            });
            ipcMain.once(IpcChannels.interceptWrite.cancel, async (_, args: { data: string, cancel: boolean }) => {
              await this.stop();
              return resolve(args);
            });
            const driverConfig = findCustomDriverConfigRuntimeNode(customDriverNode.runtime);
            if (driverConfig) {
              const commInterface = NodeRedManager.instance.utils.getCommunicationInterfaceForDevice(driverConfig.unitId);
              if (commInterface) {
                ipcMain.sendToAll(IpcChannels.interceptWrite.request, { deviceName: driverConfig?.unitId, ifaceName: commInterface.name, data });
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
    await this.identifyAllIdentifiableDevices();
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

  async stop(err?: Error) {
    await NodeRedManager.instance.stopCurrentAction();
    if (this.currentRun && this.currentRun.sectionId && this.currentRun.actionId) {
      const section = this.currentRun.sectionId;
      const action = this.currentRun.actionId;
      setImmediate(() => ipcMain.sendToAll(IpcChannels.actions.stateChanged, { section: section, action: action, state: 'stopped' }));
    }
    this.endCurrentRun(true);
    if (err && WindowManager.instance.mainWindow) WindowManager.instance.showErrorDialog(WindowManager.instance.mainWindow.webContents, err);
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
