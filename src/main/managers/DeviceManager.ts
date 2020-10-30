import { ipcMain } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels } from '../../constants';
import { Device } from '../../drivers/devices/Device';
import { Fluke45 } from '../../drivers/devices/digital-multimeters/Fluke45';
import { Keysight34401A } from '../../drivers/devices/digital-multimeters/Keysight34401A';
import { Fluke5522A } from '../../drivers/devices/multi-product-calibrators/Fluke5522ADevice';
import electronLog from 'electron-log';
import { logToCurrentActionRun } from './current-action-log-handler';

const log = electronLog.scope('DeviceManager');

interface Events {
  deviceAdded: (name: string) => void;
}

export type DriverName = 'Fluke 45' | 'Keysight 34401A' | 'Fluke 5522A';

export class DeviceManager extends TypedEmitter<Events> {

  private static fInstance: DeviceManager;
  static get instance() {
    if (!DeviceManager.fInstance) DeviceManager.fInstance = new DeviceManager();
    return DeviceManager.fInstance;
  }

  private fDevices = new Map<string, Device>();

  private constructor() {
    super();
    log.info('Loaded');
  }

  get devices() { return Array.from(this.fDevices, ([_, value]) => (value)); }

  private addDevice(deviceName: string, device: Device) {
    if (this.fDevices.has(deviceName)) throw new Error(`Device, ${deviceName}, already exists`);
    this.fDevices.set(deviceName, device);
    device.on('stringReceived', (iface, data) => {
      setImmediate(() => {
        if (device.communicationInterface) logToCurrentActionRun({ interfaceName: device.communicationInterface.name, deviceName: deviceName, message: `Data received: ${data}`, data: data });
        ipcMain.sendToAll(IpcChannels.device.onReadString, { interfaceName: iface.name, deviceName: device.name, data: data });
      });
    });
    device.on('write', (iface, data) => {
      setImmediate(() => {
        if (device.communicationInterface) {
          const dataString = new TextDecoder().decode(data);
          logToCurrentActionRun({ interfaceName: device.communicationInterface.name, deviceName: deviceName, message: `Data sent: ${dataString}`, data: data });
        }
        ipcMain.sendToAll(IpcChannels.device.onWrite, { interfaceName: iface.name, deviceName: device.name, data: data });
      });
    });
  }

  get(driverName: 'Fluke 45', deviceName: string): Fluke45;
  get(driverName: 'Keysight 34401A', deviceName: string): Keysight34401A;
  get(driverName: 'Fluke 5522A', deviceName: string): Fluke5522A;
  get(driverName: string, deviceName: string): unknown;
  get(driverName: DriverName, deviceName: string) {
    switch (driverName) {
      case 'Fluke 45':
        if (this.fDevices.has(deviceName)) return this.fDevices.get(deviceName) as Fluke45;
        const fluke45 = new Fluke45();
        fluke45.name = deviceName;
        this.addDevice(deviceName, fluke45);
        return fluke45;
      case 'Keysight 34401A':
        if (this.fDevices.has(deviceName)) return this.fDevices.get(deviceName) as Keysight34401A;
        const keysight34401A = new Keysight34401A();
        keysight34401A.name = deviceName;
        this.addDevice(deviceName, keysight34401A);
        return keysight34401A;
      case 'Fluke 5522A':
        if (this.fDevices.has(deviceName)) return this.fDevices.get(deviceName) as Fluke5522A;
        const fluke5522A = new Fluke5522A();
        fluke5522A.name = deviceName;
        this.addDevice(deviceName, fluke5522A);
        return fluke5522A;
    }
  }

  clear() {
    this.fDevices.clear();
  }

}
