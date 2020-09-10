import { IpcChannels } from '../../constants';
import { CommunicationInterface } from '../../drivers/communication-interfaces/CommunicationInterface';
import { EmulatedCommunicationInterface } from '../../drivers/communication-interfaces/EmulatedCommunicationInterface';
import { PrologixGpibTcpInterface } from '../../drivers/communication-interfaces/prologix/PrologixGpibTcpInterface';
import { PrologixGpibUsbInterface } from '../../drivers/communication-interfaces/prologix/PrologixGpibUsbInterface';
import { TypedEmitter } from 'tiny-typed-emitter';
import { ipcMain } from 'electron';

interface Events {
  interfaceConnecting: (iface: ICommunicationInterface) => void;
  interfaceConnected: (iface: ICommunicationInterface, err?: Error) => void;
  interfaceDisconnected: (iface: ICommunicationInterface, err?: Error) => void;
  interfaceDataReceived: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
  interfaceStringReceived: (iface: ICommunicationInterface, data: string) => void;
  interfaceError: (iface: ICommunicationInterface, err: Error) => void;
  interfaceAdded: (iface: ICommunicationInterface) => void;
  interfaceRemoved: (name: string) => void;
  interfaceWrite: (iface: ICommunicationInterface, data: ArrayBuffer) => void;
}

export class CommunicationInterfaceManager extends TypedEmitter<Events> {

  private fInterfaces: CommunicationInterface[];

  constructor() {
    super();
    this.fInterfaces = [];
  }

  add(communicationInterface: CommunicationInterface) {
    const ifaceExists = this.exists(communicationInterface.name);
    if (ifaceExists) throw new Error(`Interface, ${name}, already exists in the collection`);
    this.fInterfaces.push(communicationInterface);
    communicationInterface.on('connected', this.onInterfaceConnected);
    communicationInterface.on('connecting', this.onInterfaceConnecting);
    communicationInterface.on('dataReceived', this.onInterfaceDataReceived);
    communicationInterface.on('stringReceived', this.onInterfaceStringReceived);
    communicationInterface.on('disconnected', this.onInterfaceDisconnected);
    communicationInterface.on('write', this.onInterfaceWrite);
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
    communicationInterface.removeAllListeners('disconnected');
    communicationInterface.removeAllListeners('write');
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

  clear() {
    try {
      this.disableAll();
      this.disconnectAll();
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
    }
    if (!iface) throw new Error(`Unknown communication interface type, ${info.type}`);
    iface.name = info.name;
    return iface;
  }

  loadFromSession(session: Session) {
    this.clear();
    if (!session.configuration || !session.configuration.benchConfigName) throw new Error(`Session, ${session.name}, does not have a configuration or bench configuration name`);
    const config = global.visualCal.userManager.getBenchConfig(session.username, session.configuration.benchConfigName);
    if (!config) throw new Error(`Bench configuration, ${session.configuration.benchConfigName}, does not exist in session, ${session.name}`);
    config.interfaces.forEach(info => {
      const iface = this.createFromInfo(info);
      this.add(iface);
    });
  }

  async connectAll() {
    return new Promise(async (resolve, reject) => {
      try {
        for (const iface of this.fInterfaces) {
          await iface.connect();
        }
        return resolve();
      } catch (error) {
        this.disconnectAll();
        return reject(error.message);
      }
    });
  }

  disconnectAll() {
    for (const iface of this.fInterfaces) {
      iface.disconnect();
    }
  }

  enableAll() {
    this.fInterfaces.forEach(i => i.enable());
  }

  disableAll() {
    this.fInterfaces.forEach(i => i.disable());
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

  private onInterfaceDisconnected(communicationInterface: ICommunicationInterface, err?: Error) {
    this.emit('interfaceDisconnected', communicationInterface, err);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.disconnected, { name: communicationInterface.name, err: err });
    });
  }

  private onInterfaceWrite(communicationInterface: ICommunicationInterface, data: ArrayBuffer) {
    this.emit('interfaceWrite', communicationInterface, data);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.write, { name: communicationInterface.name, data: data });
    });
  }

  private onInterfaceError(communicationInterface: ICommunicationInterface, err: Error) {
    this.emit('interfaceDisconnected', communicationInterface, err);
    setImmediate(() => {
      ipcMain.sendToAll(IpcChannels.communicationInterface.error, { name: communicationInterface.name, err: err});
    });
  }

}
