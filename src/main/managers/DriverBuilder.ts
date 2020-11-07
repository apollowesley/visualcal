import { ipcMain } from 'electron';
import electronStore from 'electron-cfg';
import electronLog from 'electron-log';
import { TypedEmitter } from 'tiny-typed-emitter';
import { CommunicationInterfaceConfigurationInfo } from 'visualcal-common/dist/bench-configuration';
import { CommunicationInterfaceActionInfo, Library, IpcChannels, QueryStringInfo, Status, WriteInfo, Driver } from 'visualcal-common/dist/driver-builder';
import { CommunicationInterface } from '../../drivers/communication-interfaces/CommunicationInterface';
import { sleep } from '../../drivers/utils';
import { CommunicationInterfaceManager } from './CommunicationInterfaceManager';
import { Types } from 'mongoose';

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

  private fStore: electronStore<Library> = electronStore.create<Library>('driver-builder-library.json', log);
  private fCommunicationInterface?: CommunicationInterface;

  private constructor() {
    super();
    log.info('Loaded');
  }

  get drivers() { return this.fStore.get('drivers', []); }
  get instructions() { return this.fStore.get('instructions', []); }
  get instructionSets() { return this.fStore.get('instructionSets', []); }

  async connect(info: CommunicationInterfaceConfigurationInfo) {
    if (this.fCommunicationInterface) throw new Error('Already connected');
    try {
      this.fCommunicationInterface = CommunicationInterfaceManager.instance.createFromInfo(info);
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

  getLibrary() {
    const library = this.fStore.getAll();
    if (!library.drivers) library.drivers = [];
    if (!library.instructionSets) library.instructionSets = [];
    if (!library.instructions) library.instructions = [];
    return library;
  }

  setLibrary(library: Library) {
    this.fStore.setAll(library);
  }

  saveDriver(driver: Driver) {
    const drivers = this.drivers;
    const existingDriverIndex = drivers.findIndex(d => d.driverManufacturer === driver.driverManufacturer && d.driverModel === driver.driverModel && d.driverNomenclature === driver.driverNomenclature);
    if (existingDriverIndex > -1) {
      drivers[existingDriverIndex] = driver;
    } else {
      drivers.push(driver);
    }
    this.fStore.set('drivers', drivers);
  }

  getDriver(manufacturer: string, model: string) {
    return this.drivers.find(d => d.driverManufacturer === manufacturer && d.driverModel === model);
  }

  getDriverIdentityInfos() {
    return this.drivers.map(d => {
      return {
        manufacturer: d.driverManufacturer,
        model: d.driverModel,
        nomenclature: d.driverNomenclature
      }
    });
  }

  public init() {
    this.initIpcListeners();
  }

  private initIpcListeners() {
    ipcMain.on(IpcChannels.communicationInterface.getDriverIdentityInfos.request, (event) => {
      if (event.sender.isDestroyed()) return;
      return event.reply(IpcChannels.communicationInterface.getDriverIdentityInfos.response, this.getDriverIdentityInfos());
    });

    ipcMain.on(IpcChannels.communicationInterface.getLibrary.request, (event) => {
      if (event.sender.isDestroyed()) return;
      return event.reply(IpcChannels.communicationInterface.getLibrary.response, this.getLibrary());
    });

    ipcMain.on(IpcChannels.communicationInterface.setLibrary.request, (event, library: Library) => {
      if (event.sender.isDestroyed()) return;
      this.setLibrary(library);
      return event.reply(IpcChannels.communicationInterface.setLibrary.response, true);
    });

    ipcMain.on(IpcChannels.communicationInterface.saveDriver.request, (event, driver: Driver) => {
      if (event.sender.isDestroyed()) return;
      this.saveDriver(driver);
      return event.reply(IpcChannels.communicationInterface.saveDriver.response, true);
    });

    ipcMain.on(IpcChannels.communicationInterface.getDriver.request, async (event, opts: { manufacturer: string, model: string }) => {
      try {
        if (event.sender.isDestroyed()) return;
        const driver = this.getDriver(opts.manufacturer, opts.model);
        return event.reply(IpcChannels.communicationInterface.getDriver.response, driver);
      } catch (error) {
        return event.reply(IpcChannels.communicationInterface.getDriver.error, error);
      }
    });

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
