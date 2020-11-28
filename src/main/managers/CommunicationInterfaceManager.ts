import { IpcChannels } from '../../constants';
import { CommunicationInterface } from '../../drivers/communication-interfaces/CommunicationInterface';
import { EmulatedCommunicationInterface } from '../../drivers/communication-interfaces/EmulatedCommunicationInterface';
import { PrologixGpibTcpInterface } from '../../drivers/communication-interfaces/prologix/PrologixGpibTcpInterface';
import { PrologixGpibUsbInterface } from '../../drivers/communication-interfaces/prologix/PrologixGpibUsbInterface';
import { TypedEmitter } from 'tiny-typed-emitter';
import { ipcMain } from 'electron';
import { NationalInstrumentsGpibInterface } from '../../drivers/communication-interfaces/national-instruments/NationalInstrumentsGpibInterface';
import { CommunicationInterfaceConfigurationInfo, DefaultTiming } from 'visualcal-common/dist/bench-configuration';
import { IpcChannels as BenchConfigIpcChannels } from 'visualcal-common/dist/bench-configuration';
import { getSerialPorts } from '../../drivers/utils';
import { logToCurrentActionRun } from './current-action-log-handler';
import electronLog from 'electron-log';
import { SerialInterface } from '../../drivers/communication-interfaces/SerialInterface';

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

const log = electronLog.scope('CommunicationInterfaceManager');

export class CommunicationInterfaceManager extends TypedEmitter<Events> {

  public static get instance() { return CommunicationInterfaceManager.fInstance; }
  private static fInstance = new CommunicationInterfaceManager();

  private fInterfaces: CommunicationInterface[];

  private constructor() {
    super();
    this.fInterfaces = [];
    this.initIpcListeners();
    log.info('Loaded');
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
       case 'Serial Port':
         iface = new SerialInterface();
         const serialInterface = iface as SerialInterface;
         if (!info.serial) throw new Error('Serial communication interface configuration is missing');
         serialInterface.configure({
           id: info.name,
           portName: info.serial.port,
           baudRate: info.serial.baudRate
         });
         break;
    }
    if (!iface) throw new Error(`Unknown communication interface type, ${info.type}`);
    iface.name = info.name;
    if (info.timing) {
      info.timing.connectTimeout > 0 ? iface.connectTimeout = info.timing.connectTimeout : iface.connectTimeout = DefaultTiming.connectTimeout;
      info.timing.readTimeout > 0 ? iface.readTimeout = info.timing.readTimeout : iface.readTimeout = DefaultTiming.readTimeout;
      info.timing.writeTimeout > 0 ? iface.writeTimeout = info.timing.writeTimeout : iface.writeTimeout = DefaultTiming.writeTimeout;
      iface.delayBeforeWrite = info.timing.delayBeforeWrite !== undefined ? info.timing.delayBeforeWrite : 0;
      iface.delayAfterWrite = info.timing.delayAfterWrite !== undefined ? info.timing.delayAfterWrite : 0;
      iface.delayBeforeRead = info.timing.delayBeforeRead !== undefined ? info.timing.delayBeforeRead : 0;
      iface.delayAfterRead = info.timing.delayAfterRead !== undefined ? info.timing.delayAfterRead : 0;
    }
    iface.resetOnConnect = info.resetOnConnect !== undefined ? info.resetOnConnect : true;
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

  async setCurrentDeviceAddress(ci: CommunicationInterface, deviceUnitId: string) {
    const activeSession = global.visualCal.userManager.activeSession;
    if (!activeSession || !activeSession.configuration) return;
    const foundDevice = activeSession.configuration.devices.find(d => d.unitId === deviceUnitId);
    if (!foundDevice || !foundDevice.gpib) return;
    await ci.setDeviceAddress(foundDevice.gpibAddress);
  }
  
  private onInterfaceConnected(communicationInterface: ICommunicationInterface, err?: Error) {
    this.emit('interfaceConnected', communicationInterface, err);
    setImmediate(() => {
      logToCurrentActionRun({ interfaceName: communicationInterface.name, message: 'Connected' });
      ipcMain.sendToAll(IpcChannels.communicationInterface.connected, { interfaceName: communicationInterface.name, err: err });
    });
  }

  private onInterfaceConnecting(communicationInterface: ICommunicationInterface) {
    this.emit('interfaceConnecting', communicationInterface);
    setImmediate(() => {
      logToCurrentActionRun({ interfaceName: communicationInterface.name, message: 'Connecting' });
      ipcMain.sendToAll(IpcChannels.communicationInterface.connecting, { interfaceName: communicationInterface.name });
    });
  }

  private onInterfaceDataReceived(communicationInterface: ICommunicationInterface, data: ArrayBuffer) {
    this.emit('interfaceDataReceived', communicationInterface, data);
    setImmediate(() => {
      logToCurrentActionRun({ interfaceName: communicationInterface.name, message: 'Data received', data: data });
      ipcMain.sendToAll(IpcChannels.communicationInterface.dataReceived, { interfaceName: communicationInterface.name, data: data });
    });
  }

  private onInterfaceStringReceived(communicationInterface: ICommunicationInterface, data: string) {
    this.emit('interfaceStringReceived', communicationInterface, data);
    setImmediate(() => {
      logToCurrentActionRun({ interfaceName: communicationInterface.name, message: `String data received: ${data}`, data: data });
      ipcMain.sendToAll(IpcChannels.communicationInterface.stringReceived, { interfaceName: communicationInterface.name, data: data });
    });
  }

  private onInterfaceDisconnecting(communicationInterface: ICommunicationInterface, err?: Error) {
    this.emit('interfaceDisconnecting', communicationInterface, err);
    setImmediate(() => {
      logToCurrentActionRun({ interfaceName: communicationInterface.name, message: 'Disconnecting', error: err });
      ipcMain.sendToAll(IpcChannels.communicationInterface.disconnecting, { interfaceName: communicationInterface.name, err: err });
    });
  }

  private onInterfaceDisconnected(communicationInterface: ICommunicationInterface, err?: Error) {
    this.emit('interfaceDisconnected', communicationInterface, err);
    setImmediate(() => {
      logToCurrentActionRun({ interfaceName: communicationInterface.name, message: 'Disconnected', error: err });
      ipcMain.sendToAll(IpcChannels.communicationInterface.disconnected, { interfaceName: communicationInterface.name, err: err });
    });
  }

  private onInterfaceBeforeWrite(communicationInterface: ICommunicationInterface, data: ArrayBuffer) {
    this.emit('interfaceBeforeWrite', communicationInterface, data);
    setImmediate(() => {
      const dataString = new TextDecoder().decode(data);
      logToCurrentActionRun({ interfaceName: communicationInterface.name, message: `Sending data: ${dataString}`, data: data });
      ipcMain.sendToAll(IpcChannels.communicationInterface.beforeWrite, { interfaceName: communicationInterface.name, data: data });
    });
  }

  private onInterfaceAfterWrite(communicationInterface: ICommunicationInterface, data: ArrayBuffer) {
    this.emit('interfaceAfterWrite', communicationInterface, data);
    setImmediate(() => {
      const dataString = new TextDecoder().decode(data);
      logToCurrentActionRun({ interfaceName: communicationInterface.name, message: `Data sent: ${dataString}`, data: data });
      ipcMain.sendToAll(IpcChannels.communicationInterface.afterWrite, { interfaceName: communicationInterface.name, data: data });
    });
  }

  private onInterfaceError(communicationInterface: ICommunicationInterface, err: Error) {
    this.emit('interfaceError', communicationInterface, err);
    setImmediate(() => {
      logToCurrentActionRun({ interfaceName: communicationInterface.name, message: `Error: ${err.message}`, error: err });
      ipcMain.sendToAll(IpcChannels.communicationInterface.error, { interfaceName: communicationInterface.name, err: err});
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
