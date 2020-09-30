import { IpcChannels } from '../../constants';
import { CommunicationInterface } from '../../drivers/communication-interfaces/CommunicationInterface';
import { EmulatedCommunicationInterface } from '../../drivers/communication-interfaces/EmulatedCommunicationInterface';
import { PrologixGpibTcpInterface } from '../../drivers/communication-interfaces/prologix/PrologixGpibTcpInterface';
import { PrologixGpibUsbInterface } from '../../drivers/communication-interfaces/prologix/PrologixGpibUsbInterface';
import { TypedEmitter } from 'tiny-typed-emitter';
import { ipcMain } from 'electron';
import { NationalInstrumentsGpibInterface } from '../../drivers/communication-interfaces/national-instruments/NationalInstrumentsGpibInterface';
import { CommunicationInterfaceConfigurationInfo } from 'visualcal-common/dist/bench-configuration';
import { IpcChannels as BenchConfigIpcChannels } from 'visualcal-common/dist/bench-configuration';
import { getSerialPorts } from '../../drivers/utils';

interface Events {
  interfaceConnecting: (iface: ICommunicationInterface) => void;
  interfaceConnected: (iface: ICommunicationInterface, err?: Error) => void;
  interfaceDisconnecting: (iface: ICommunicationInterface, err?: Error) => void; 
  interfaceDisconnected: (iface: ICommunicationInterface, err?: Error) => void;
  interfaceDataReceived: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  interfaceStringReceived: (iface: ICommunicationInterface, data: string) => void;
  interfaceError: (iface: ICommunicationInterface, err: Error) => void;
  interfaceAdded: (iface: ICommunicationInterface) => void;
  interfaceRemoved: (name: string) => void;
  interfaceBeforeWrite: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  interfaceAfterWrite: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
}

export class CommunicationInterfaceManager extends TypedEmitter<Events> {

  private fInterfaces: CommunicationInterface[];

  constructor() {
    super();
    this.fInterfaces = [];
    this.initIpcListeners();
  }

  add(communicationInterface: CommunicationInterface) {
    const ifaceExists = this.exists(communicationInterface.name);
    if (ifaceExists) throw new Error(`Interface, ${name}, already exists in the collection`);
    this.fInterfaces.push(communicationInterface);
    communicationInterface.on('connected', this.onInterfaceConnected);
    communicationInterface.on('connecting', this.onInterfaceConnecting);
    communicationInterface.on('dataReceived', this.onInterfaceDataReceived);
    communicationInterface.on('stringReceived', this.onInterfaceStringReceived);
    communicationInterface.on('disconnecting', this.onInterfaceDisconnecting);
    communicationInterface.on('disconnected', this.onInterfaceDisconnected);
    communicationInterface.on('beforeWrite', this.onInterfaceBeforeWrite);
    communicationInterface.on('afterWrite', this.onInterfaceAfterWrite);
    communicationInterface.on('error', this.onInterfaceError);
    this.emit('interfaceAdded', communicationInterface);
    ipcMain.sendToAll(IpcChannels.communicationInterface.added, { name: communicationInterface.name });
  }

  remove(name: string) {
    const existingIndex = this.fInterfaces.findIndex(i => i.name.toLocaleUpperCase() === name.toLocaleUpperCase());
    const communicationInterface = this.fInterfaces.splice(existingIndex, 1)[0];
    communicationInterface.removeAllListeners('connected');
    communicationInterface.removeAllListeners('connecting');
    communicationInterface.removeAllListeners('dataReceived');
    communicationInterface.removeAllListeners('stringReceived');
    communicationInterface.removeAllListeners('disconnecting');
    communicationInterface.removeAllListeners('disconnected');
    communicationInterface.removeAllListeners('beforeWrite');
    communicationInterface.removeAllListeners('afterWrite');
    communicationInterface.removeAllListeners('error');
    this.emit('interfaceRemoved', communicationInterface.name);
    ipcMain.sendToAll(IpcChannels.communicationInterface.removed, { name: communicationInterface.name });
  }

  exists(name: string) {
    return this.find(name) !== undefined;
  }

  find(name: string) {
    return this.fInterfaces.find(i => i.name.toLocaleUpperCase() === name.toLocaleUpperCase());
  }

  async clear() {
    try {
      await this.disconnectAll();
    } catch (error) {
      throw error;
    } finally {
      this.fInterfaces = [];
    }
  }

  createFromInfo(info: CommunicationInterfaceConfigurationInfo) {
    let iface: CommunicationInterface | null = null;
    switch (info.type) {
      case 'Emulated':
        iface = new EmulatedCommunicationInterface();
        break;
      case 'Prologix GPIB TCP':
        iface = new PrologixGpibTcpInterface();
        const prologixTcpIface = iface as PrologixGpibTcpInterface;
        if (!info.tcp) throw new Error('TCP communiation interface configuration is missing');
        prologixTcpIface.configure({
          id: info.name,
          host: info.tcp.host,
          port: info.tcp.port
        });
        break;
      case 'Prologix GPIB USB':
        iface = new PrologixGpibUsbInterface();
        const prologixUsbIface = iface as PrologixGpibUsbInterface;
        if (!info.serial) throw new Error('Serial communiation interface configuration is missing');
        prologixUsbIface.configure({
          id: info.name,
          portName: info.serial.port
        });
        break;
      case 'National Instruments GPIB':
        iface = new NationalInstrumentsGpibInterface();
        const niGpib = iface as NationalInstrumentsGpibInterface;
        if (!info.nationalInstrumentsGpib) throw new Error('GPIB communication interface configuration is missing');
        niGpib.configure({
          id: info.name
        });
        niGpib.address = info.nationalInstrumentsGpib.address;
        break;
    }
    if (!iface) throw new Error(`Unknown communication interface type, ${info.type}`);
    iface.name = info.name;
    if (info.timing) {
      if (info.timing.connectTimeout) iface.connectTimeout = info.timing.connectTimeout;
      if (info.timing.delayBeforeWrite) iface.delayBeforeWrite = info.timing.delayBeforeWrite;
      if (info.timing.delayAfterWrite) iface.delayAfterWrite = info.timing.delayAfterWrite;
      if (info.timing.delayBeforeRead) iface.delayBeforeRead = info.timing.delayBeforeRead;
      if (info.timing.delayAfterRead) iface.delayAfterRead = info.timing.delayAfterRead;
    }
    if (info.resetOnConnect) iface.resetOnConnect = info.resetOnConnect;
    return iface;
  }

  async loadFromSession(session: Session) {
    await this.clear();
    if (!session.configuration || !session.configuration.benchConfigName) throw new Error(`Session, ${session.name}, does not have a configuration or bench configuration name`);
    const config = global.visualCal.userManager.getBenchConfig(session.username, session.configuration.benchConfigName);
    if (!config) throw new Error(`Bench configuration, ${session.configuration.benchConfigName}, does not exist in session, ${session.name}`);
    config.interfaces.forEach(info => {
      const iface = this.createFromInfo(info);
      this.add(iface);
    });
  }

  /**
   * Connects all registered communication interfaces
   * @param names Optional array of communication interfaces to connect
   */
  async connectAll(names?: string[]) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        for (const iface of this.fInterfaces) {
          if (!names || (names && names.includes(iface.name))) await iface.connect();
        }
        return resolve();
      } catch (error) {
        await this.disconnectAll();
        return reject(error.message);
      }
    });
  }

  async disconnectAll() {
    for (const iface of this.fInterfaces) {
      await iface.disconnect();
    }
  }

  private onInterfaceConnected(communicationInterface: ICommunicationInterface, err?: Error) {
    this.emit('interfaceConnected', communicationInterface, err);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.connected, { name: communicationInterface.name, err: err });
    });
  }

  private onInterfaceConnecting(communicationInterface: ICommunicationInterface) {
    this.emit('interfaceConnecting', communicationInterface);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.connecting, { name: communicationInterface.name });
    });
  }

  private onInterfaceDataReceived(communicationInterface: ICommunicationInterface, data: ArrayBuffer) {
    this.emit('interfaceDataReceived', communicationInterface, data);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.dataReceived, { name: communicationInterface.name, data: data });
    });
  }

  private onInterfaceStringReceived(communicationInterface: ICommunicationInterface, data: string) {
    this.emit('interfaceStringReceived', communicationInterface, data);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.stringReceived, { name: communicationInterface.name, data: data });
    });
  }

  private onInterfaceDisconnecting(communicationInterface: ICommunicationInterface, err?: Error) {
    this.emit('interfaceDisconnecting', communicationInterface, err);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.disconnecting, { name: communicationInterface.name, err: err });
    });
  }

  private onInterfaceDisconnected(communicationInterface: ICommunicationInterface, err?: Error) {
    this.emit('interfaceDisconnected', communicationInterface, err);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.disconnected, { name: communicationInterface.name, err: err });
    });
  }

  private onInterfaceBeforeWrite(communicationInterface: ICommunicationInterface, data: ArrayBuffer) {
    this.emit('interfaceBeforeWrite', communicationInterface, data);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.beforeWrite, { name: communicationInterface.name, data: data });
    });
  }

  private onInterfaceAfterWrite(communicationInterface: ICommunicationInterface, data: ArrayBuffer) {
    this.emit('interfaceAfterWrite', communicationInterface, data);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.afterWrite, { name: communicationInterface.name, data: data });
    });
  }

  private onInterfaceError(communicationInterface: ICommunicationInterface, err: Error) {
    this.emit('interfaceDisconnected', communicationInterface, err);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.error, { name: communicationInterface.name, err: err});
    });
  }

  private initIpcListeners() {
    ipcMain.on(BenchConfigIpcChannels.GetSerialPortsRequest, async (event) => {
      if (event.sender.isDestroyed()) return;
      try {
        event.reply(BenchConfigIpcChannels.GetSerialPortsResponse, await getSerialPorts());
      } catch (error) {
        event.reply(BenchConfigIpcChannels.GetSerialPortsError, error);
      }
    });
  }

}
