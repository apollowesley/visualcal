import { TypedEmitter } from 'tiny-typed-emitter';
import Tabulator from 'tabulator-tables';
import { v4 as uuid } from 'uuid';

interface CommInterfaceLogEntry {
  id?: string;
  name: string;
  message: string;
}

interface ConstructorOptions {
  tableId: string;
  clearButtonElementId: string;
}

interface Events {
  entryAdded: (entry: CommInterfaceLogEntry) => void;
}

export class DeviceLogHandler extends TypedEmitter<Events> {

  private fTable: Tabulator;
  private fClearButtonElement: HTMLButtonElement;
  private fEntries: CommInterfaceLogEntry[] = [];

  constructor(opts: ConstructorOptions) {
    super();
    this.fClearButtonElement = document.getElementById(opts.clearButtonElementId) as HTMLButtonElement;
    this.fClearButtonElement.addEventListener('click', () => this.clear());

    this.fTable = new Tabulator(`#${opts.tableId}`, {
      data: [],
      layout: 'fitColumns',
      columns: [
        { title: 'Interface Name', field: 'name' },
        { title: 'Message', field: 'message' }
      ]
    });

    window.visualCal.communicationInterfaceManager.on('interfaceConnected', async (info) => await this.add({ name: info.name, message: 'Connected' }));
    window.visualCal.communicationInterfaceManager.on('interfaceConnecting', async (info) => await this.add({ name: info.name, message: 'Connecting' }));
    window.visualCal.communicationInterfaceManager.on('interfaceDisconnected', async (info) => await this.add({ name: info.name, message: 'Disconnected' }));
    window.visualCal.communicationInterfaceManager.on('interfaceError', async (info) => await this.add({ name: info.name, message: `Error:  ${info.err.message}` }));
    window.visualCal.communicationInterfaceManager.on('interfaceStringReceived', async (info) => await this.add({ name: info.name, message: `Data received: ${info.data}` }));
    window.visualCal.communicationInterfaceManager.on('interfaceWrite', async (info) => {
      const dataString = new TextDecoder().decode(info.data);
      await this.add({ name: info.name, message: `Data sent: ${dataString}` });
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
