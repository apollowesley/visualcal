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
    { title: 'Description', field: 'description', editable: true, editor: 'input' },
    { title: 'Section', field: 'sectionId' },
    { title: 'Action', field: 'actionId' },
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

  private createInputRunsTable(runs: LogicRun<string, number>[] = []) {
    const table = new Tabulator(this.inputRunsTabulatorElement, {
      layout: 'fitColumns',
      columns: this.columns,
      movableRows: true,
      movableRowsConnectedTables: this.outputRunsTabulatorElement,
      movableRowsSender: 'delete',
      movableRowsReceiver: 'add'
    });
    table.setData(runs);
    return table;
  }

  private createOutputRunsTable(runs: LogicRun<string, number>[] = []) {
    const table = new Tabulator(this.outputRunsTabulatorElement, {
      layout: 'fitColumns',
      columns: this.columns,
      movableRows: true,
      movableRowsConnectedTables: this.inputRunsTabulatorElement,
      movableRowsSender: 'delete',
      movableRowsReceiver: 'add'
    });
    table.setData(runs);
    return table;
  }

  private getInputRunsTable() {
    if (!this.fInputRunsTable) this.fInputRunsTable = this.createInputRunsTable();
    return this.fInputRunsTable;
  }

  private getOutputRunsTable() {
    if (!this.fInputRunsTable) this.fInputRunsTable = this.createInputRunsTable();
    return this.fInputRunsTable;
  }

  async mounted() {
    const runs = await window.ipc.getRunsForCurrentSession();
    console.info(runs);
    this.fInputRunsTable = this.createInputRunsTable(runs);
    this.fOutputRunsTable = this.createOutputRunsTable();
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
