import { ipcMain } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { CommunicationInterfaceConfigurationInfo } from 'visualcal-common/dist/bench-configuration';
import { IpcChannels } from 'visualcal-common/dist/driver-builder';
import { CommunicationInterface } from '../../drivers/communication-interfaces/CommunicationInterface';
import electronLog from 'electron-log';

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
    try {
      this.fCommunicationInterface = global.visualCal.communicationInterfaceManager.createFromInfo(info);
      await this.fCommunicationInterface.connect();
    } catch (error) {
      this.disconnect();
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

  async write(data: ArrayBufferLike) {
    if (!this.fCommunicationInterface) throw new Error('Not connected');
    await this.fCommunicationInterface.write(data);
  }

  async read() {
    if (!this.fCommunicationInterface) throw new Error('Not connected');
    return await this.fCommunicationInterface.read();
  }

  async queryString(data: string) {
    if (!this.fCommunicationInterface) throw new Error('Not connected');
    return await this.fCommunicationInterface.queryString(data);
  }

  public init() {
    this.initIpcListeners();
  }

  private initIpcListeners() {
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
    ipcMain.on(IpcChannels.communicationInterface.write.request, async (event, data: ArrayBufferLike) => {
      try {
        if (event.sender.isDestroyed()) return;
        await this.write(data);
        return event.reply(IpcChannels.communicationInterface.write.response, true);
      } catch (error) {
        return event.reply(IpcChannels.communicationInterface.write.error, error);
      }
    });
    ipcMain.on(IpcChannels.communicationInterface.read.request, async (event) => {
      try {
        if (event.sender.isDestroyed()) return;
        const data = await this.read();
        return event.reply(IpcChannels.communicationInterface.read.response, data);
      } catch (error) {
        return event.reply(IpcChannels.communicationInterface.read.error, error);
      }
    });
    ipcMain.on(IpcChannels.communicationInterface.queryString.request, async (event, data: string) => {
      try {
        if (event.sender.isDestroyed()) return;
        const responseData = await this.queryString(data);
        return event.reply(IpcChannels.communicationInterface.queryString.response, responseData);
      } catch (error) {
        return event.reply(IpcChannels.communicationInterface.queryString.error, error);
      }
    });
  }

}
