<template>
  <div>
    <div ref="tabulatorElement" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';
import { Procedure } from 'visualcal-common/dist/session-view-info';

@Component
export default class TabulatorComponent extends Vue {

  private fTable?: Tabulator;

  @Prop({ type: Array, required: true }) columns!: Tabulator.ColumnDefinition[];
  @Prop({ type: String, required: false, default: 'fitColumns' }) layout!: 'fitData' | 'fitColumns' | 'fitDataFill' | 'fitDataStretch' | 'fitDataTable' | undefined;
  @Prop({ type: Array, required: false, default: function() { return {}; } }) data!: Procedure[];
  @Prop({ type: Boolean, required: false, default: false }) showRowHover!: boolean;

  get tabulatorElement() { return this.$refs.tabulatorElement as HTMLDivElement; }

  private createTable() {
    const table = new Tabulator(this.tabulatorElement, {
      layout: this.layout,
      columns: this.columns,
      rowMouseEnter: this.onRowMouseEnter
    });
    table.setData(this.data);
    return table;
  }

  private getTable() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  mounted() {
    this.createTable();
  }

  @Watch('data')
  async onDataChanged(newData: unknown[]) {
    const table = this.getTable();
    await table.setData(newData);
  }

  private onRowMouseEnter(_e: UIEvent, row: Tabulator.RowComponent) {
    const rowElement = row.getElement();
    if (this.showRowHover) {
      rowElement.style.background = '#bbb';
    } else {
      rowElement.style.background = 'white';
    }
  }

}
</script>

<style lang="scss">
$rowHoverBackground:#00578C;
@import '../../node_modules/tabulator-tables/dist/css/tabulator_simple.min.css';
</style>
