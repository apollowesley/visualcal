import { TypedEmitter } from 'tiny-typed-emitter';
import Tabulator from 'tabulator-tables';
import { v4 as uuid } from 'uuid';
import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../../../constants';
import { CommInterfaceLogEntry } from 'visualcal-common/dist/result';
import moment from 'moment';

interface ConstructorOptions {
  tableId: string;
}

interface Events {
  entryAdded: (entry: CommInterfaceLogEntry) => void;
  interfaceConnected: (interfaceName: string) => void;
  interfaceDisconnected: (interfaceName: string) => void;
}

export class DeviceLogHandler extends TypedEmitter<Events> {

  private fTable: Tabulator;
  private fEntries: CommInterfaceLogEntry[] = [];

  constructor(opts: ConstructorOptions) {
    super();
    this.fTable = new Tabulator(`#${opts.tableId}`, {
      data: [],
      layout: 'fitDataStretch',
      height: '90%',
      columns: [
        { title: 'Timestamp', field: 'timestamp', formatter: 'datetime' },
        { title: 'Source', field: 'source' },
        { title: 'Interface Name', field: 'interfaceName' },
        { title: 'Device name', field: 'deviceName' },
        { title: 'Type', field: 'type' },
        { title: 'Data / Command / Message', field: 'message' }
      ]
    });

    window.visualCal.communicationInterfaceManager.on('interfaceConnected', async (info) => {
      await this.add({ interfaceName: info.interfaceName, source: 'Interface', type: 'Connection', message: 'Connected' });
      this.emit('interfaceConnected', info.interfaceName);
    });
    window.visualCal.communicationInterfaceManager.on('interfaceConnecting', async (info) => await this.add({ interfaceName: info.interfaceName, source: 'Interface', type: 'Connection', message: 'Connecting' }));
    window.visualCal.communicationInterfaceManager.on('interfaceDisconnecting', async (info) => await this.add({ interfaceName: info.interfaceName, source: 'Interface', type: 'Connection', message: 'Disconnecting' }));
    window.visualCal.communicationInterfaceManager.on('interfaceDisconnected', async (info) => {
      await this.add({ interfaceName: info.interfaceName, source: 'Interface', type: 'Connection', message: 'Disconnected' });
      this.emit('interfaceDisconnected', info.interfaceName);
    });
    window.visualCal.communicationInterfaceManager.on('interfaceError', async (info) => await this.add({ interfaceName: info.interfaceName, source: 'Interface', type: 'Error', message: info.err.message }));
    window.visualCal.communicationInterfaceManager.on('interfaceStringReceived', async (info) => await this.add({ interfaceName: info.interfaceName, source: 'Interface', type: 'Data received', message: info.data }));
    window.visualCal.communicationInterfaceManager.on('interfaceBeforeWrite', async (info) => {
      const dataString = new TextDecoder().decode(info.data);
      await this.add({ interfaceName: info.interfaceName, source: 'Interface', type: 'Sending data', message: dataString });
    });
    window.visualCal.communicationInterfaceManager.on('interfaceAfterWrite', async (info) => {
      const dataString = new TextDecoder().decode(info.data);
      await this.add({ interfaceName: info.interfaceName, source: 'Interface', type: 'Data sent', message: dataString });
    });

    ipcRenderer.on(IpcChannels.device.onReadString, async (_, info: { interfaceName: string, deviceName: string, data: string }) => await this.add({
      interfaceName: info.interfaceName, source: 'Device', type: 'Data received', deviceName: info.deviceName, message: info.data }));
    ipcRenderer.on(IpcChannels.device.onWrite, async (_, info: { interfaceName: string, deviceName: string, data: ArrayBuffer | string }) => {
      let dataString = '';
      if (Array.isArray(info.data) && typeof info.data === 'object') {
        dataString = new TextDecoder().decode(info.data as ArrayBufferLike);
      } else {
        dataString = info.data as string;
      }
      await this.add({ interfaceName: info.interfaceName, source: 'Device', type: 'Data sent', deviceName: info.deviceName, message: dataString });
    });
  }

  private async syncTable() {
    await this.fTable.setData(this.fEntries);
    this.fTable.redraw(true);
    if (this.fEntries.length <= 0) return;
    const lastRow = this.fTable.getRowFromPosition(this.fTable.getRows().length - 1);
    if (!lastRow) return;
    await lastRow.scrollTo();
  }

  clear() {
    this.fEntries.length = 0;
    this.syncTable();
  }

  async add(entry: CommInterfaceLogEntry) {
    entry.id = uuid();
    if (!entry.timestamp) entry.timestamp = new Date(),
    this.fEntries.push(entry);
    await this.syncTable();
    this.emit('entryAdded', entry);
  }

}
