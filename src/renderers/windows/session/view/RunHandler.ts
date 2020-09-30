import { TypedEmitter } from 'tiny-typed-emitter';
import Tabulator from 'tabulator-tables';
import { RendererRunManager } from '../../../managers/RendererRunManager';
import { LogicResult, LogicRun } from 'visualcal-common/dist/result';

interface ConstructorOptions {
  tableId: string;
  runManager: RendererRunManager;
}

interface Events {
  resultAdded: (result: LogicResult<string, number>) => void;
}

export class RunHandler extends TypedEmitter<Events> {

  private fRunManager: RendererRunManager;
  private fTable: Tabulator;
  private fCurrentRun?: LogicRun<string, number>;

  constructor(opts: ConstructorOptions) {
    super();
    this.fTable = new Tabulator(`#${opts.tableId}`, {
      data: [],
      layout: 'fitColumns',
      columns: [
        { title: 'Timestamp', field: 'timestamp' },
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

    this.fRunManager = opts.runManager;
    this.fRunManager.on('runStarted', async (run) => {
      this.fCurrentRun = run;
      await this.fTable.setData(this.fCurrentRun.results);
    });
    this.fRunManager.on('resultAdded', async (result) => {
      if (!this.fCurrentRun) return;
      this.fCurrentRun.results.push(result);
      await this.fTable.setData(this.fCurrentRun.results);
    });
  }

  get currentRunId() { return this.fCurrentRun ? this.fCurrentRun.id : undefined; }

}
