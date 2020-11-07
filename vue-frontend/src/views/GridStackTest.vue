<template>
  <v-container fluid class="grey" style="height: 100vh">
    <div class="grid-stack" />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.css';
import { generateUuid } from '@/utils/uuid';

@Component
export default class GridStackTestView extends Vue {

  private fGrid?: GridStack;

  get grid() {
    if (this.fGrid) return this.fGrid;
    return this.createGrid();
  }

  private createGrid() {
    this.fGrid = GridStack.init({ float: true, alwaysShowResizeHandle: true, maxRow: 9 });
    return this.fGrid;
  }

  async mounted() {
    for (let index = 0; index < 12; index++) {
      const tableElement = document.createElement('div');
      tableElement.classList.add('tabulator-test-table')
      const table = new Tabulator(tableElement ,{
        columns: [{ title: 'ID', field: 'id' }, { title: 'Name', field: 'name' }],
        layout: 'fitDataStretch'
      });
      const gridElement = this.grid.addWidget({ x: index, y: 0 });
      gridElement.ondragend = () => table.redraw();
      gridElement.onresize = () => table.redraw();
      gridElement.appendChild(tableElement);
      const data: { _id: string, name: string }[] = [];
      for (let index = 0; index < 11; index++) {
        data.push({ _id: generateUuid(), name: `Test ${index}` });
      }
      await table.setData(data);
    }
  }

}
</script>

<style>
  .grid-stack {
    border-width: 1px;
    border: dashed;
    max-height: 98vh;
  }

  .grid-stack-item-content {
    background-color: lightgray;
  }

  .tabulator-test-table {
    margin: 10px;
    margin-bottom: 10px;
  }
</style>
