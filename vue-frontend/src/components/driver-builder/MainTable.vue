<template>
  <v-container fluid class="grey">
    <v-row no-gutters>
      <v-col
        class="text-center"
      >
        <div ref="tableElement" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Tablulator from 'tabulator-tables';
import { v4 as uuid } from 'uuid';

type CommandType = 'Read' | 'Write' | 'Query';
type DataType = 'Boolean' | 'Number' | 'String' | 'Binary' | 'IEEE-488.2 Identity';

interface Instruction {
  id: string;
  name: string;
  description?: string;
  commandType: CommandType;
  responseDataType?: DataType;
  delayBefore?: number;
  delayAfter?: number;
  command: string;
}

const MockInstructions: Instruction[] = [
  { id: uuid(), name: 'Get identity', commandType: 'Query', responseDataType: 'String', delayAfter: 500, command: '*IDN?' }
];

@Component
export default class MainTableComponent extends Vue {

  private fTable?: Tablulator;

  get tableElement() { return this.$refs.tableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  private getInstructionFromCell(cell: Tablulator.CellComponent) { return cell.getRow().getData() as Instruction; }

  private getIsResponseDataTypeEditable(cell: Tablulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    return instruction.commandType === 'Read' || instruction.commandType === 'Query';
  }

  private getIsCommandEditable(cell: Tablulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    if (instruction.commandType === 'Read') return false;
    return true;
  }

  private getCommandTypeEditorParams(): Tablulator.SelectParams {
    return {
      values: {
        Write: 'Write',
        Read: 'Read',
        Query: 'Query',
      }
    };
  }

  private getResponseDataTypeEditorParams(): Tablulator.SelectParams {
    return {
      values: {
        Boolean: 'Boolean',
        Number: 'Number',
        String: 'String',
        Binary: 'Binary',
        Ieee4882Identity: 'IEEE-488.2 Identity'
      }
    };
  }

  private async updateInstruction(cell: Tabulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    if (this.getIsResponseDataTypeEditable(cell)) {
      if (!instruction.responseDataType) instruction.responseDataType = 'String';
    } else {
      instruction.responseDataType = undefined;
    }
    await this.table.updateData([instruction]);
    this.table.redraw(true);
  }

  private formatResponseDataTypeCell(cell: Tablulator.CellComponent) {
    const isEditable = this.getIsResponseDataTypeEditable(cell);
    const div = document.createElement('div') as HTMLDivElement;
    div.style.backgroundColor = isEditable ? '' :'#b5b5b5';
    div.style.height = '100%';
    div.style.width = '100%';
    if (isEditable) div.innerText = cell.getValue();
    return div;
  }

  private formatCommandCell(cell: Tablulator.CellComponent) {
    const isEditable = this.getIsCommandEditable(cell);
    const div = document.createElement('div') as HTMLDivElement;
    div.style.backgroundColor = isEditable ? '' :'#b5b5b5';
    div.style.height = '100%';
    div.style.width = '100%';
    if (isEditable) div.innerText = cell.getValue();
    return div;
  }

  private columns: Tablulator.ColumnDefinition[] = [
    { title: 'Name', field: 'name', editable: true, editor: 'input', validator: 'required' },
    { title: 'Command type', field: 'commandType', editable: true, editor: 'select', editorParams: this.getCommandTypeEditorParams, cellEdited: this.updateInstruction },
    { title: 'Description', field: 'description', editable: true, editor: 'input' },
    { title: 'Response data type (Read/Query only)', field: 'responseDataType', editable: this.getIsResponseDataTypeEditable, editor: 'select', editorParams: this.getResponseDataTypeEditorParams, formatter: this.formatResponseDataTypeCell },
    { title: 'Delay before (ms)', field: 'delayBefore', editable: true, editor: 'number', validator: 'min: 0' },
    { title: 'Delay after (ms)', field: 'delayAfter', editable: true, editor: 'number', validator: 'min: 0' },
    { title: 'Command', field: 'command', editable: this.getIsCommandEditable, editor: 'input', validator: 'required', formatter: this.formatCommandCell }
  ]

  private createTable() {
    const table = new Tablulator(this.tableElement, {
      layout: 'fitData',
      columns: this.columns,
      cellEdited: () => { table.redraw(true) }
    });
    this.fTable = table;
    return table;
  }

  async mounted() {
    const table = this.table;
    await table.setData(MockInstructions);
  }

}
</script>

<style>

</style>
