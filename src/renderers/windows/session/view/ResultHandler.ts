import { TypedEmitter } from 'tiny-typed-emitter';
import Tabulator from 'tabulator-tables';
import { IpcChannels } from '../../../../constants';
import { LoadResponseArgs } from '../../../managers/RendererResultManager';

interface ConstructorOptions {
  tableId: string;
  clearResultsElementId: string;
  runsSelectElementId: string;
}

interface Events {
  resultAdded: (result: LogicResult) => void;
}

export class ResultHandler extends TypedEmitter<Events> {

  private fTable: Tabulator;
  private fClearResultsElement: HTMLButtonElement;
  private fRunsSelectElement: HTMLSelectElement;

  private fResults: LogicResult[] = [];

  constructor(opts: ConstructorOptions) {
    super();
    this.fClearResultsElement = document.getElementById(opts.clearResultsElementId) as HTMLButtonElement;
    this.fClearResultsElement.addEventListener('click', () => this.clear());

    this.fRunsSelectElement = document.getElementById(opts.runsSelectElementId) as HTMLSelectElement;
    this.fRunsSelectElement.addEventListener('change', () => this.onRunsSelectElementSelectedOptionChanged());

    this.fTable = new Tabulator(`#${opts.tableId}`, {
      data: [],
      layout: 'fitColumns',
      columns: [
        { title: 'Timestamp', field: 'timestamp' },
        { title: 'Section', field: 'section' },
        { title: 'Action', field: 'action' },
        { title: 'Type', field: 'type' },
        { title: 'Description', field: 'description' },
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

  private refreshRunIds() {
    const runIds = this.fResults.filter((value, index, self) => self.indexOf(value) === index).map(r => r.runId);
    runIds.forEach(runId => {
      let found = false;
      for (let index = 0; index < this.fRunsSelectElement.options.length; index++) {
        const option = this.fRunsSelectElement.options[index];
        const curOptionRunId = option.value;
        if (curOptionRunId === runId) {
          found = true;
          break;
        };
      }
      if (!found) {
        const newOption = document.createElement('option');
        newOption.value = runId;
        newOption.text = runId;
        this.fRunsSelectElement.options.add(newOption);
      }
    });

  }

  private onRunsSelectElementSelectedOptionChanged() {
    if (this.fRunsSelectElement.selectedOptions.length <= 0) return;
    const runId = this.fRunsSelectElement.selectedOptions[0].value;
    this.fTable.clearFilter(false);
    this.fTable.addFilter('runId', '=', runId);
  } 

  private async syncTable() {
    await this.fTable.setData(this.fResults);
    if (this.fResults.length <= 0) return;
    const lastRow = this.fTable.getRowFromPosition(this.fTable.getRows().length - 1);
    if (!lastRow) return;
    await lastRow.scrollTo();
    this.refreshRunIds();
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