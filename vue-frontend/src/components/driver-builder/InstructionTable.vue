<template>
  <v-container class="grey">
    <v-row no-gutters>
      <v-btn class="ma-2 ml-0" color="primary" @click="addNewInstruction">Add Instruction</v-btn>
    </v-row>
    <v-row no-gutters>
      <v-col
        class="text-center"
      >
        <div ref="tableElement" class="tabulator instruction-drag-target" dropzone @dragover="onDragOver" @drop="onDrop" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';
import { generateUuid } from '@/utils/uuid';
import { CommandParameter, Instruction } from 'visualcal-common/src/driver-builder';

@Component
export default class InstructionTableComponent extends Vue {

  @Prop({ type: Array, required: true }) instructions!: Instruction[];

  private fTable?: Tabulator;

  @Watch('instructions', { deep: true })
  async onInstructionsChanged() {
    await this.setData(this.instructions);
  }

  get tableElement() { return this.$refs.tableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  private async setData(instructions: Instruction[]) {
    const stringCopy = JSON.stringify(instructions);
    const copy = JSON.parse(stringCopy);
    await this.table.setData(copy);
    this.table.redraw();
  }

  private getInstructionFromCell(cell: Tabulator.CellComponent) { return cell.getRow().getData() as Instruction; }

  private getIsResponseDataTypeEditable(cell: Tabulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    return instruction.type === 'Read' || instruction.type === 'Query';
  }

  private getIsCommandEditable(cell: Tabulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    if (instruction.type === 'Read') return false;
    return true;
  }

  private getIsReadAttemptsEditable(cell: Tabulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    return instruction.type === 'Read' || instruction.type === 'Query';
  }

  private getisReadResponseNameEditable(cell: Tabulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    return instruction.type === 'Read' || instruction.type === 'Query';
  }

  private getCommandTypeEditorParams(): Tabulator.SelectParams {
    return {
      values: {
        Write: 'Write',
        Read: 'Read',
        Query: 'Query',
        setVariable: 'Set Variable'
      }
    };
  }

  private getResponseDataTypeEditorParams(): Tabulator.SelectParams {
    return {
      values: {
        Boolean: 'Boolean',
        Number: 'Number',
        String: 'String',
        Binary: 'Binary'
      }
    };
  }

  private getSettableVariablesEditorParams() {
    return this.$store.direct.state.driverBuilder.currentDriver.variables ? this.$store.direct.state.driverBuilder.currentDriver.variables.map(variable => variable.name) : [];
  }

  private async updateInstruction(cell: Tabulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    if (!instruction.readAttempts) instruction.readAttempts = 1;
    if (this.getIsResponseDataTypeEditable(cell)) {
      if (!instruction.responseDataType) instruction.responseDataType = 'String';
    } else {
      instruction.responseDataType = undefined;
    }
    await this.table.updateData([instruction]);
    this.table.redraw(true);
  }

  private formatResponseDataTypeCell(cell: Tabulator.CellComponent) {
    const isEditable = this.getIsResponseDataTypeEditable(cell);
    const div = document.createElement('div') as HTMLDivElement;
    div.style.backgroundColor = isEditable ? '' :'#b5b5b5';
    div.style.height = '100%';
    div.style.width = '100%';
    if (isEditable) div.innerText = cell.getValue();
    return div;
  }

  private formatCommandCell(cell: Tabulator.CellComponent) {
    const isEditable = this.getIsCommandEditable(cell);
    const div = document.createElement('div') as HTMLDivElement;
    div.style.backgroundColor = isEditable ? '' :'#b5b5b5';
    div.style.height = '100%';
    div.style.width = '100%';
    if (isEditable) div.innerText = cell.getValue();
    return div;
  }

  private formatReadAttemptsCell(cell: Tabulator.CellComponent) {
    const isEditable = this.getIsReadAttemptsEditable(cell);
    const div = document.createElement('div') as HTMLDivElement;
    div.style.backgroundColor = isEditable ? '' :'#b5b5b5';
    div.style.height = '100%';
    div.style.width = '100%';
    if (isEditable) div.innerText = cell.getValue();
    return div;
  }

  private formatResponseNameCell(cell: Tabulator.CellComponent) {
    const isEditable = this.getisReadResponseNameEditable(cell);
    const div = document.createElement('div') as HTMLDivElement;
    div.style.backgroundColor = isEditable ? '' :'#b5b5b5';
    div.style.height = '100%';
    div.style.width = '100%';
    if (isEditable) div.innerText = cell.getValue() ? cell.getValue() : '';
    return div;
  }

  private getParametersFormatter(cell: Tabulator.CellComponent, type: 'pre' | 'post') {
    const parameters = type === 'pre' ? cell.getRow().getData().preParameters as CommandParameter[] : cell.getRow().getData().postParameters;
    return parameters ? parameters.length.toString() : '0';
  }

  private reorderInstructions() {
    const rows = this.table.getRows();
    const instructions: Instruction[] = [];
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const instruction = row.getData() as Instruction;
      instruction.order = index;
      instructions.push(instruction);
    }
    this.$emit('reordered', { instructions });
  }

  private getIsVariableFieldEditable(cell: Tabulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    if (!instruction || instruction.type !== 'setVariable') return false;
    return true;
  }

  private columns: Tabulator.ColumnDefinition[] = [
    { title: '', rowHandle: true, formatter: 'handle', headerSort: false, frozen: true, width: 30, minWidth: 30, resizable: false, field: 'order' },
    { title: 'Name*', field: 'name', editable: true, editor: 'input', validator: 'required', minWidth: 150 },
    { title: 'Type*', field: 'type', editable: true, editor: 'select', editorParams: this.getCommandTypeEditorParams, cellEdited: this.updateInstruction },
    { title: 'Read/Query', columns: [
      { title: 'Data type', field: 'responseDataType', editable: this.getIsResponseDataTypeEditable, editor: 'select', editorParams: this.getResponseDataTypeEditorParams, formatter: this.formatResponseDataTypeCell },
      { title: 'Read attempts before failure', field: 'readAttempts', editable: this.getIsReadAttemptsEditable, editor: 'number', validator: 'min: 1', formatter: this.formatReadAttemptsCell },
      { title: 'Tag Name', field: 'responseName', editable: this.getisReadResponseNameEditable, editor: 'input', formatter: this.formatResponseNameCell }
    ]},
    { title: 'Timing (in addition to interface timing)', columns: [
      { title: 'Delay before (ms)', field: 'delayBefore', editable: true, editor: 'number', validator: 'min: 0', minWidth: 150 },
      { title: 'Delay after (ms)', field: 'delayAfter', editable: true, editor: 'number', validator: 'min: 0', minWidth: 150 }
    ]},
    { title: 'Variable', field: 'variable', editable: this.getIsVariableFieldEditable, editor: 'select', editorParams: this.getSettableVariablesEditorParams },
    { title: 'Prepend Parameters', editable: false, formatter: (cell) => this.getParametersFormatter(cell, 'pre'), cellClick: (_, cell) => this.$emit('edit-instruction-pre-parameters', { instruction: cell.getRow().getData(), instructions: cell.getRow().getTable().getData() }) },
    { title: 'Command/Variable Value', field: 'command', editable: true, editor: 'input', minWidth: 250 },
    { title: 'Append Parameters', editable: false, formatter: (cell) => this.getParametersFormatter(cell, 'post'), cellClick: (_, cell) => this.$emit('edit-instruction-post-parameters', { instruction: cell.getRow().getData(), instructions: cell.getRow().getTable().getData() }) }
  ]

  private createRowContextMenu(): (Tabulator.MenuObject<Tabulator.RowComponent> | Tabulator.MenuSeparator)[] {
    const menu: Tabulator.RowContextMenuSignature = [
      {
        label: 'Save to library',
        action: (_, row) => {
          this.$emit('save-instruction-to-library', row.getData());
        }
      },
      {
        separator: true
      },
      {
        label: 'Delete',
        action: (_, row) => {
          this.table.deleteRow(row);
          this.$emit('instruction-removed', row.getData() as Instruction);
          // this.reorderInstructions(this.table);
        }
      }
    ];
    return menu;
  }

  private createTable() {
    if (this.fTable) return this.fTable;
    const table = new Tabulator(this.tableElement, {
      index: '_id',
      layout: 'fitDataStretch',
      columns: this.columns,
      movableRows: true,
      rowContextMenu: this.createRowContextMenu(),
      headerSort: false,
      rowMoved: this.reorderInstructions,
      initialSort: [ { column: 'order', dir: 'asc' } ],
      cellEdited: (cell) => {
        const instruction = cell.getRow().getData() as Instruction;
        this.$emit('instruction-updated', instruction);
        this.table.redraw();
      },
      // rowMoved: () => { this.reorderInstructions(table); }
    });
    this.fTable = table;
    return table;
  }

  async mounted() {
    this.createTable();
    if (this.instructions) await this.setData(this.instructions);
    window.addEventListener('resize', async () => {
      await this.$nextTick();
      this.table.redraw();
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer) return;
    event.dataTransfer.dropEffect = 'copy';
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer) return;
    const instructionString = event.dataTransfer.getData('application/json');
    const instruction = JSON.parse(instructionString) as Instruction;
    instruction.order = -1;
    await this.table.addData([instruction]);
    this.$emit('instruction-added', instruction);
  }

  async addNewInstruction() {
    const newInstruction: Instruction = {
      _id: generateUuid(),
      order: this.table.getRows().length,
      name: 'Instruction',
      type: 'Write',
      command: '',
      readAttempts: 1
    }
    await this.table.addRow(newInstruction);
    this.$emit('instruction-added', newInstruction);
  }

}
</script>

<style>
.tabulator {
  width: 100%;
}
</style>
