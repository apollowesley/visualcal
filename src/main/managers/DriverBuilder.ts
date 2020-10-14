import { ipcMain } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { CommunicationInterfaceConfigurationInfo } from 'visualcal-common/dist/bench-configuration';
import { CommunicationInterfaceActionInfo, IpcChannels, QueryStringInfo, Status, WriteInfo } from 'visualcal-common/dist/driver-builder';
import { CommunicationInterface } from '../../drivers/communication-interfaces/CommunicationInterface';
import electronLog from 'electron-log';
import { sleep } from '../../drivers/utils';

interface Events {
  connected: () => void;
  disconnected: () => void;
}

const log = electronLog.scope('DriverBuilder');

export class DriverBuilder extends TypedEmitter<Events> {

  private static fInstance?: DriverBuilder;
  public static get instance() {
    if (!DriverBuilder.fInstance) DriverBuilder.fInstance = new DriverBuilder();
    return DriverBuilder.fInstance;
  }

  private fCommunicationInterface?: CommunicationInterface;

  private constructor() {
    super();
    log.info('Loaded');

  }

  async connect(info: CommunicationInterfaceConfigurationInfo) {
    if (this.fCommunicationInterface) throw new Error('Already connected');
    try {
      this.fCommunicationInterface = global.visualCal.communicationInterfaceManager.createFromInfo(info);
      await this.fCommunicationInterface.connect();
    } catch (error) {
      await this.disconnect();
      throw error;
    }
  }

  async disconnect() {
    if (!this.fCommunicationInterface) return;
    try {
      await this.fCommunicationInterface.disconnect();
    } catch (error) {
      console.error(error);
    } finally {
      this.fCommunicationInterface = undefined;
    }
  }

  async setDeviceGpibAddress(address: number) {
    if (!this.fCommunicationInterface) throw new Error('Not connected');
    await this.fCommunicationInterface.setDeviceAddress(address);
  }

  async write(info: WriteInfo) {
    if (!this.fCommunicationInterface) throw new Error('Not connected');
    if (info.terminator) await this.fCommunicationInterface.setEndOfStringTerminator(info.terminator as EndOfStringTerminator);
    if (info.delayBefore && info.delayBefore > 0) await sleep(info.delayBefore);
    await this.fCommunicationInterface.write(info.data);
    if (info.delayAfter && info.delayAfter > 0) await sleep(info.delayAfter);
  }

  async read(info: CommunicationInterfaceActionInfo) {
    if (!this.fCommunicationInterface) throw new Error('Not connected');
    if (info.terminator) await this.fCommunicationInterface.setEndOfStringTerminator(info.terminator as EndOfStringTerminator);
    if (info.delayBefore && info.delayBefore > 0) await sleep(info.delayBefore);
    const response = await this.fCommunicationInterface.read();
    if (info.delayAfter && info.delayAfter > 0) await sleep(info.delayAfter);
    return response;
  }

  async queryString(info: QueryStringInfo) {
    if (!this.fCommunicationInterface) throw new Error('Not connected');
    if (info.terminator) await this.fCommunicationInterface.setEndOfStringTerminator(info.terminator as EndOfStringTerminator);
    if (info.delayBefore && info.delayBefore > 0) await sleep(info.delayBefore);
    const response = await this.fCommunicationInterface.queryString(info.data);
    if (info.delayAfter && info.delayAfter > 0) await sleep(info.delayAfter);
    return response;
  }

  public init() {
    this.initIpcListeners();
  }

  private initIpcListeners() {
    ipcMain.on(IpcChannels.communicationInterface.getStatus.request, (event) => {
      if (event.sender.isDestroyed()) return;
      const status: Status = {
        isConnected: this.fCommunicationInterface !== undefined && this.fCommunicationInterface.isConnected,
        communicationInterfaceName: this.fCommunicationInterface ? this.fCommunicationInterface.name : undefined
      };
      return event.reply(IpcChannels.communicationInterface.getStatus.response, status);
    });
    ipcMain.on(IpcChannels.communicationInterface.connect.request, async (event, info: CommunicationInterfaceConfigurationInfo) => {
      try {
        if (event.sender.isDestroyed()) return;
        await this.connect(info);
        return event.reply(IpcChannels.communicationInterface.connect.response, true);
      } catch (error) {
        return event.reply(IpcChannels.communicationInterface.connect.error, error);
      }
    });
    ipcMain.on(IpcChannels.communicationInterface.disconnect.request, async (event) => {
      try {
        await this.disconnect();
        if (event.sender.isDestroyed()) return;
        return event.reply(IpcChannels.communicationInterface.disconnect.response, true);
      } catch (error) {
        return event.reply(IpcChannels.communicationInterface.disconnect.error, error);
      }
    });
    ipcMain.on(IpcChannels.communicationInterface.write.request, async (event, info: WriteInfo) => {
      try {
        if (event.sender.isDestroyed()) return;
        if (info.deviceGpibAddress) await this.setDeviceGpibAddress(info.deviceGpibAddress);
        await this.write(info);
        return event.reply(IpcChannels.communicationInterface.write.response, true);
      } catch (error) {
        return event.reply(IpcChannels.communicationInterface.write.error, error);
      }
    });
    ipcMain.on(IpcChannels.communicationInterface.read.request, async (event, info: CommunicationInterfaceActionInfo) => {
      try {
        if (event.sender.isDestroyed()) return;
        if (info.deviceGpibAddress) await this.setDeviceGpibAddress(info.deviceGpibAddress);
        const data = await this.read(info);
        return event.reply(IpcChannels.communicationInterface.read.response, data);
      } catch (error) {
        return event.reply(IpcChannels.communicationInterface.read.error, error);
      }
    });
    ipcMain.on(IpcChannels.communicationInterface.queryString.request, async (event, info: QueryStringInfo) => {
      try {
        if (event.sender.isDestroyed()) return;
        if (info.deviceGpibAddress) await this.setDeviceGpibAddress(info.deviceGpibAddress);
        const responseData = await this.queryString(info);
        return event.reply(IpcChannels.communicationInterface.queryString.response, responseData);
      } catch (error) {
        return event.reply(IpcChannels.communicationInterface.queryString.error, error);
      }
    });
  }

}
