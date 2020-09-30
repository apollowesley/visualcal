<template>
  <v-container fluid class="grey" style="height: 100vh">
    <ViewResultsDialogComponent
      :should-show="fViewResultsDialogShouldShow"
      :run="fSelectedRun"
      @cancel="fViewResultsDialogShouldShow = false"
    />
    <v-row>
      <v-col>
        <v-row>
          <v-col
            cols="6"
          >
            Available Runs
            <div ref="inputRunsTabulatorElement" />
          </v-col>
          <v-col
            cols="6"
          >
            Runs to keep
            <v-btn
              style="margin: 10px"
              @click="saveAsJson"
            >
              Save as JSON
            </v-btn>
            <v-btn
              style="margin: 10px"
              @click="saveAsCsv"
            >
              Save as CSV
            </v-btn>
            <div ref="outputRunsTabulatorElement" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ViewResultsDialogComponent from '@/components/results/ViewResultsDialog.vue';
import Tabulator from 'tabulator-tables';
import { LogicRun } from 'visualcal-common/src/result';

interface LogicResult {
  rawValue: string;
  value: number;
}

@Component({
  components: {
    ViewResultsDialogComponent
  }
})
export default class ResultsView extends Vue {

  columns: Tabulator.ColumnDefinition[] = [
    { title: 'Description', field: 'description', frozen: true },
    { title: 'Section', field: 'sectionId', frozen: true },
    { title: 'Action', field: 'actionId', frozen: true },
    { title: 'Started', field: 'startTimestamp' },
    { title: 'Completed?', formatter: (cell) => {
        if ((cell.getRow().getData() as LogicRun<string, number>).stopTimestamp !== undefined) {
          return `<div style="height: 100%; width: 100%; color: green">Yes</div>`;
        }
        return `<div style="height: 100%; width: 100%; color: red">No</div>`;
      }
    },
    { title: 'Passed?', formatter: (cell) => {
        if (this.getDidRunPass(cell.getRow().getData())) {
          return `<div style="height: 100%; width: 100%; color: green">Yes</div>`;
        }
        return `<div style="height: 100%; width: 100%; color: red">No</div>`;
      }
    },
    { title: '', formatter: this.createViewResultsColumnButton }
  ];

  fInputRunsTable?: Tabulator;
  fOutputRunsTable?: Tabulator;
  fSelectedRun: LogicRun<string, number> | null = null;
  fViewResultsDialogShouldShow = false;

  get inputRunsTabulatorElement() { return this.$refs.inputRunsTabulatorElement as HTMLDivElement; }
  get outputRunsTabulatorElement() { return this.$refs.outputRunsTabulatorElement as HTMLDivElement; }

  get inputRuns() { return this.fInputRunsTable ? this.fInputRunsTable.getData() as LogicRun<string, number>[] : []; }
  get outputRuns() { return this.fOutputRunsTable ? this.fOutputRunsTable.getData() as LogicRun<string, number>[] : []; }

  get canSave() { return this.fOutputRunsTable !== undefined && this.outputRuns !== undefined && this.outputRuns.length > 0; }

  private createViewResultsColumnButton(cell: Tabulator.CellComponent) {
    const button = document.createElement('button') as HTMLButtonElement;
    button.textContent = 'View Results';
    button.style.backgroundColor = '#b5b5b5';
    button.style.marginLeft = '7px';
    button.style.marginRight = '7px';
    button.style.padding = '7px';
    button.style.width = '90%';
    button.style.boxShadow = '2px 2px #888888';
    button.onclick = () => {
      this.fSelectedRun = cell.getRow().getData();
      this.fViewResultsDialogShouldShow = true;
    };
    return button;
  }

  private getDidRunPass(run: LogicRun<string, number>) {
    return run.results.every(r => r.passed);
  }

  private async createInputRunsTable(runs: LogicRun<string, number>[] = []) {
    const table = new Tabulator(this.inputRunsTabulatorElement, {
      layout: 'fitColumns',
      columns: this.columns,
      movableRows: true,
      movableRowsConnectedTables: this.outputRunsTabulatorElement,
      movableRowsSender: 'delete',
      movableRowsReceiver: 'add'
    });
    await table.setData(runs);
    return table;
  }

  private async createOutputRunsTable(runs: LogicRun<string, number>[] = []) {
    const table = new Tabulator(this.outputRunsTabulatorElement, {
      layout: 'fitColumns',
      columns: this.columns,
      movableRows: true,
      movableRowsConnectedTables: this.inputRunsTabulatorElement,
      movableRowsSender: 'delete',
      movableRowsReceiver: 'add'
    });
    await table.setData(runs);
    return table;
  }

  private async getInputRunsTable() {
    if (!this.fInputRunsTable) this.fInputRunsTable = await this.createInputRunsTable();
    return this.fInputRunsTable;
  }

  private async getOutputRunsTable() {
    if (!this.fInputRunsTable) this.fInputRunsTable = await this.createInputRunsTable();
    return this.fInputRunsTable;
  }

  async mounted() {
    const runs = await window.ipc.getRunsForCurrentSession();
    this.fInputRunsTable = await this.createInputRunsTable(runs);
    this.fOutputRunsTable = await this.createOutputRunsTable();
  }

  async saveAsJson() {
    if (!this.fOutputRunsTable) return;
    this.fOutputRunsTable.download('json', 'results.json');
  }

  async saveAsCsv() {
    if (!this.fOutputRunsTable) return;
    this.fOutputRunsTable.download('csv', 'results.csv');
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
