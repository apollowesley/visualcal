<template>
  <v-container
    fluid
  >
    <v-row
      no-gutters
    >
      <v-col>
        <div
          ref="tableElement"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';

@Component
export default class SessionResultsComponent extends Vue {

  private fTable?: Tabulator;

  columns: Tabulator.ColumnDefinition[] = [
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
  ];

  get tableElement() { return this.$refs.tableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  async mounted() {
    await this.table.setData([]);
  }

  private createTable() {
    if (this.fTable) return this.fTable;
    const table = new Tabulator(this.tableElement, {
      index: '_id',
      layout: 'fitColumns',
      columns: this.columns
    });
    this.fTable = table;
    return table;
  }

}
</script>

<style>

</style>