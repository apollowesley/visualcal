import { TypedEmitter } from 'tiny-typed-emitter';
import Tabulator from 'tabulator-tables';

interface ConstructorOptions {
  tableId: string;
  clearButtonElementId: string;
}

interface Events {
  entryAdded: (entry: any) => void;
}

export class MainLogHandler extends TypedEmitter<Events> {

  private fTable: Tabulator;
  private fEntries: any[] = [];

  constructor(opts: ConstructorOptions) {
    super();
    this.fTable = new Tabulator(`#${opts.tableId}`, {
      data: [],
      layout: 'fitColumns',
      columns: [
        { title: 'Type', field: 'type' },
        { title: 'Session', field: 'sessionId' },
        { title: 'Run', field: 'runId' },
        { title: 'Section', field: 'section' },
        { title: 'Action', field: 'action' },
        { title: 'State', field: 'state' },
        { title: 'Message', field: 'message' }
      ]
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

  async add(entry: any) {
    this.fEntries.push(entry);
    await this.syncTable();
  }

}