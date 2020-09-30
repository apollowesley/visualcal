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

  private async createTable() {
    const table = new Tabulator(this.tabulatorElement, {
      layout: this.layout,
      columns: this.columns
      // rowMouseEnter: this.onRowMouseEnter
    });
    await table.setData(this.data);
    table.redraw();
    return table;
  }

  private async getTable() {
    if (!this.fTable) this.fTable = await this.createTable();
    return this.fTable;
  }

  mounted() {
    this.createTable();
  }

  @Watch('data')
  async onDataChanged(newData: unknown[]) {
    const table = await this.getTable();
    await table.setData(newData);
    table.redraw();
  }

  // private onRowMouseEnter(_e: UIEvent, row: Tabulator.RowComponent) {
  //   const rowElement = row.getElement();
  //   if (this.showRowHover) {
  //     rowElement.style.background = '#bbb';
  //   } else {
  //     rowElement.style.background = 'white';
  //   }
  // }

}
</script>

<style lang="scss">
$rowHoverBackground:#00578C;
@import '../../node_modules/tabulator-tables/dist/css/tabulator_simple.min.css';
</style>
