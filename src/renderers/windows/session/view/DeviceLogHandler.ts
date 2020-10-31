import { TypedEmitter } from 'tiny-typed-emitter';
import Tabulator from 'tabulator-tables';
import { v4 as uuid } from 'uuid';
import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../../../constants';
import { CommInterfaceLogEntry } from 'visualcal-common/dist/result';

interface ConstructorOptions {
  tableId: string;
}

interface Events {
  entryAdded: (entry: CommInterfaceLogEntry) => void;
}

export class DeviceLogHandler extends TypedEmitter<Events> {

  private fTable: Tabulator;
  private fEntries: CommInterfaceLogEntry[] = [];

  constructor(opts: ConstructorOptions) {
    super();
    this.fTable = new Tabulator(`#${opts.tableId}`, {
      data: [],
      layout: 'fitColumns',
      columns: [
        { title: 'Interface Name', field: 'interfaceName' },
        { title: 'Device name', field: 'deviceName' },
        { title: 'Message', field: 'message' }
      ]
    });

    window.visualCal.communicationInterfaceManager.on('interfaceConnected', async (info) => await this.add({ interfaceName: info.interfaceName, message: 'Connected' }));
    window.visualCal.communicationInterfaceManager.on('interfaceConnecting', async (info) => await this.add({ interfaceName: info.interfaceName, message: 'Connecting' }));
    window.visualCal.communicationInterfaceManager.on('interfaceDisconnecting', async (info) => await this.add({ interfaceName: info.interfaceName, message: 'Disconnecting' }));
    window.visualCal.communicationInterfaceManager.on('interfaceDisconnected', async (info) => await this.add({ interfaceName: info.interfaceName, message: 'Disconnected' }));
    window.visualCal.communicationInterfaceManager.on('interfaceError', async (info) => await this.add({ interfaceName: info.interfaceName, message: `Error:  ${info.err.message}` }));
    window.visualCal.communicationInterfaceManager.on('interfaceStringReceived', async (info) => await this.add({ interfaceName: info.interfaceName, message: `Data received: ${info.data}` }));
    window.visualCal.communicationInterfaceManager.on('interfaceBeforeWrite', async (info) => {
      const dataString = new TextDecoder().decode(info.data);
      await this.add({ interfaceName: info.interfaceName, message: `Sending data: ${dataString}` });
    });
    window.visualCal.communicationInterfaceManager.on('interfaceAfterWrite', async (info) => {
      const dataString = new TextDecoder().decode(info.data);
      await this.add({ interfaceName: info.interfaceName, message: `Data sent: ${dataString}` });
    });

    ipcRenderer.on(IpcChannels.device.onReadString, async (_, info: { interfaceName: string, deviceName: string, data: string }) => await this.add({ interfaceName: info.interfaceName, deviceName: info.deviceName, message: `Data received: ${info.data}` }));
    ipcRenderer.on(IpcChannels.device.onWrite, async (_, info: { interfaceName: string, deviceName: string, data: ArrayBuffer }) => {
      const dataString = new TextDecoder().decode(info.data);
      await this.add({ interfaceName: info.interfaceName, deviceName: info.deviceName, message: `Data sent: ${dataString}` });
    });
  }

  private async syncTable() {
    await this.fTable.setData(this.fEntries);
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
    this.fEntries.push(entry);
    await this.syncTable();
    this.emit('entryAdded', entry);
  }

}
