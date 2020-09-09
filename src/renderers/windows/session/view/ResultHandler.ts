import { TypedEmitter } from 'tiny-typed-emitter';
import Tabulator from 'tabulator-tables';
import { IpcChannels } from '../../../../constants';
import { LoadResponseArgs } from '../../../managers/RendererResultManager';

interface ConstructorOptions {
  tableId: string;
  clearResultsElementId: string;
}

interface Events {
  resultAdded: (result: LogicResult) => void;
}

export class ResultHandler extends TypedEmitter<Events> {

  private fTable: Tabulator;
  private fClearResultsElement: HTMLButtonElement;

  private fResults: LogicResult[] = [];

  constructor(opts: ConstructorOptions) {
    super();
    this.fClearResultsElement = document.getElementById(opts.clearResultsElementId) as HTMLButtonElement;
    this.fClearResultsElement.addEventListener('click', () => this.clear());

    this.fTable = new Tabulator(`#${opts.tableId}`, {
      data: [],
      layout: 'fitColumns',
      columns: [
        { title: 'Run name', field: 'runId' },
        { title: 'Section', field: 'section' },
        { title: 'Action', field: 'action' },
        { title: 'Type', field: 'type' },
        { title: 'Description', field: 'description' },
        { title: 'Timestamp', field: 'timestamp' },
        { title: 'Base EU', field: 'baseQuantity' },
        { title: 'Derived EU', field: 'derivedQuantity' },
        { title: 'Nominal', field: 'inputLevel' },
        { title: 'Minimum', field: 'minimum' },
        { title: 'Maximum', field: 'maximum' },
        { title: 'Raw', field: 'rawValue' },
        { title: 'Measured', field: 'measuredValue' },
        { title: 'Passed', field: 'passed' }
      ]
    });

    window.visualCal.resultsManager.on(IpcChannels.results.load.response, async (response: LoadResponseArgs) => {
      this.fResults = response.results;
      await this.syncTable();
    });
    
    window.visualCal.actionManager.on('resultAcquired', async (info) => this.add(info.result));
  }

  private async syncTable() {
    await this.fTable.setData(this.fResults);
    if (this.fResults.length <= 0) return;
    const lastRow = this.fTable.getRowFromPosition(this.fTable.getRows().length - 1);
    if (!lastRow) return;
    await lastRow.scrollTo();
  }

  clear() {
    this.fResults.length = 0;
    this.syncTable();
  }

  async add(result: LogicResult) {
    this.fResults.push(result);
    await this.syncTable();
    this.emit('resultAdded', result);
  }

  loadResultsForSession(sessionName: string) {
    window.visualCal.resultsManager.load(sessionName);
  }

}