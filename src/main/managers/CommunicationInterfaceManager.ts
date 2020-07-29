import { EventEmitter } from 'events';
import { IpcChannels } from '../../@types/constants';
import { CommunicationInterface } from '../../drivers/communication-interfaces/CommunicationInterface';
import { EmulatedCommunicationInterface } from '../../drivers/communication-interfaces/EmulatedCommunicationInterface';
import { PrologixGpibTcpInterface } from '../../drivers/communication-interfaces/prologix/PrologixGpibTcpInterface';
import { PrologixGpibUsbInterface } from '../../drivers/communication-interfaces/prologix/PrologixGpibUsbInterface';

export type EventName = 'interface-connecting' | 'interface-connected' | 'interface-disconnected' | 'interface-error' | 'interface-data';

export class CommunicationInterfaceManager extends EventEmitter {

  private fInterfaces: ICommunicationInterface[];

  constructor() {
    super();
    this.fInterfaces = [];
  }

  on(event: EventName, listener: (...args: any[]) => void): this {
    const that = this.on.bind(super.on);
    return that(event, listener);
  }

  off(event: EventName, listener: (...args: any[]) => void): this {
    const that = this.on.bind(super.off);
    return that(event, listener);
  }

  emit(event: EventName, ...args: any[]): boolean {
    return super.emit(event, args);
  }

  add(communicationInterface: ICommunicationInterface) {
    const ifaceExists = this.exists(communicationInterface.name);
    if (ifaceExists) throw new Error(`Interface, ${name}, already exists in the collection`);
    this.fInterfaces.push(communicationInterface);
    communicationInterface.addConnectedHandler(this.onCommunicationInterfaceConnected);
    communicationInterface.addConnectingHandler(this.onCommunicationInterfaceConnecting);
    communicationInterface.addDataHandler(this.onCommunicationInterfaceDataReceived);
    communicationInterface.addDisconnectedHandler(this.onCommunicationInterfaceDisconnected);
    communicationInterface.addErrorHandler(this.onCommunicationInterfaceError);
  }

  remove(name: string) {
    const existingIndex = this.fInterfaces.findIndex(i => i.name.toLocaleUpperCase() === name.toLocaleUpperCase());
    const communicationInterface = this.fInterfaces.splice(existingIndex, 1)[0];
    communicationInterface.removeConnectedHandler(this.onCommunicationInterfaceConnected);
    communicationInterface.removeConnectingHandler(this.onCommunicationInterfaceConnecting);
    communicationInterface.removeDataHandler(this.onCommunicationInterfaceDataReceived);
    communicationInterface.removeDisconnectedHandler(this.onCommunicationInterfaceDisconnected);
    communicationInterface.removeErrorHandler(this.onCommunicationInterfaceError);
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

  loadFromSession(session: Session) {
    this.clear();
    session.configuration.interfaces.forEach(ifaceInfo => {
      let iface: CommunicationInterface | null = null;
      switch (ifaceInfo.type) {
        case 'Emulated':
          iface = new EmulatedCommunicationInterface();
          break;
        case 'Prologix GPIB TCP':
          iface = new PrologixGpibTcpInterface();
          const prologixTcpIface = iface as PrologixGpibTcpInterface;
          if (!ifaceInfo.tcp) throw new Error('TCP communiation interface configuration is missing');
          prologixTcpIface.configure({
            id: ifaceInfo.name,
            host: ifaceInfo.tcp.host,
            port: ifaceInfo.tcp.port
          });
          break;
        case 'Prologix GPIB USB':
          iface = new PrologixGpibUsbInterface();
          const prologixUsbIface = iface as PrologixGpibUsbInterface;
          if (!ifaceInfo.serial) throw new Error('Serial communiation interface configuration is missing');
          prologixUsbIface.configure({
            id: ifaceInfo.name,
            portName: ifaceInfo.serial.port
          });
          break;
      }
      if (!iface) throw new Error('Communication interface cannot be null');
      iface.name = ifaceInfo.name;
      this.add(iface);
    });
  }

  async connectAll() {
    return new Promise(async (resolve, reject) => {
      try {
        this.fInterfaces.forEach(async i => await i.connect());
        return resolve();
      } catch (error) {
        return reject(error.message);
      }
    });
  }

  disconnectAll() {
    this.fInterfaces.forEach(i => i.disconnect());
  }

  enableAll() {
    this.fInterfaces.forEach(i => i.enable());
  }

  disableAll() {
    this.fInterfaces.forEach(i => i.disable());
  }

  private onCommunicationInterfaceConnected(communicationInterface: ICommunicationInterface, err?: Error) {
    global.visualCal.windowManager.sendToAll(IpcChannels.communicationInterface.connected, communicationInterface.name, err);
    this.emit('interface-connected', communicationInterface, err);
  }

  private onCommunicationInterfaceConnecting(communicationInterface: ICommunicationInterface) {
    global.visualCal.windowManager.sendToAll(IpcChannels.communicationInterface.connecting, communicationInterface.name);
    this.emit('interface-connecting', communicationInterface);
  }

  private onCommunicationInterfaceDataReceived(communicationInterface: ICommunicationInterface, data: ArrayBuffer) {
    global.visualCal.windowManager.sendToAll(IpcChannels.communicationInterface.data, communicationInterface.name, data);
    this.emit('interface-data', communicationInterface, data);
  }

  private onCommunicationInterfaceDisconnected(communicationInterface: ICommunicationInterface, err?: Error) {
    global.visualCal.windowManager.sendToAll(IpcChannels.communicationInterface.disconnected, communicationInterface.name, err);
    this.emit('interface-disconnected', communicationInterface, err);
  }

  private onCommunicationInterfaceError(communicationInterface: ICommunicationInterface, err: Error) {
    global.visualCal.windowManager.sendToAll(IpcChannels.communicationInterface.error, communicationInterface.name, err);
    this.emit('interface-error', communicationInterface, err);
  }

}
