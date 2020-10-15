<template>
  <v-container fluid class="grey">
    <v-row no-gutters>
      <v-btn class="ma-2" color="primary" @click="addNewInstruction">Add Instruction</v-btn>
    </v-row>
    <v-row no-gutters>
      <v-col
        class="text-center"
      >
        <div ref="tableElement" class="instruction-drag-target" dropzone @dragover="onDragOver" @drop="onDrop" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';
import { v4 as uuid } from 'uuid';
import { CustomInstruction, Instruction } from 'visualcal-common/src/driver-builder';

@Component
export default class InstructionTableComponent extends Vue {

  @Prop({ type: Array, required: true }) instructions!: CustomInstruction[];

  private fTable?: Tabulator;

  @Watch('instructions')
  async onInstructionsChanged() {
    await this.setData(this.instructions);
    this.table.redraw();
  }

  get tableElement() { return this.$refs.tableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  private async setData(instructions: CustomInstruction[]) {
    const stringCopy = JSON.stringify(instructions);
    const copy = JSON.parse(stringCopy);
    await this.table.setData(copy);
  }

  private getInstructionFromCell(cell: Tabulator.CellComponent) { return cell.getRow().getData() as CustomInstruction; }

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

  private getCommandTypeEditorParams(): Tabulator.SelectParams {
    return {
      values: {
        Write: 'Write',
        Read: 'Read',
        Query: 'Query',
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

  private reorderInstructions(table: Tabulator) {
    const rows = table.getRows();
    const instructions: CustomInstruction[] = [];
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const instruction = row.getData() as CustomInstruction;
      instruction.order = index;
      instructions.push(instruction);
    }
    this.$emit('reordered', instructions);
  }

  private columns: Tabulator.ColumnDefinition[] = [
    { title: '', rowHandle: true, formatter: 'handle', headerSort: false, frozen: true, width: 30, minWidth: 30, resizable: false, field: 'order' },
    { title: 'Name*', field: 'name', editable: true, editor: 'input', validator: 'required' },
    { title: 'Type*', field: 'type', editable: true, editor: 'select', editorParams: this.getCommandTypeEditorParams, cellEdited: this.updateInstruction },
    { title: 'Description', field: 'description', editable: true, editor: 'input' },
    { title: 'Read/Query', columns: [
      { title: 'Data type', field: 'responseDataType', editable: this.getIsResponseDataTypeEditable, editor: 'select', editorParams: this.getResponseDataTypeEditorParams, formatter: this.formatResponseDataTypeCell },
      { title: 'Read attempts before failure', field: 'readAttempts', editable: this.getIsReadAttemptsEditable, editor: 'number', validator: 'min: 1', formatter: this.formatReadAttemptsCell }
    ]},
    { title: 'Timing (in addition to interface timing)', columns: [
      { title: 'Delay before (ms)', field: 'delayBefore', editable: true, editor: 'number', validator: 'min: 0' },
      { title: 'Delay after (ms)', field: 'delayAfter', editable: true, editor: 'number', validator: 'min: 0' }
    ]},
    { title: 'Command*', field: 'command', editable: true, validator: 'required', editor: 'input' },
    { title: 'Parameters (Click to edit)', editable: false, formatter: (cell) => cell.getRow().getData().parameters ? cell.getRow().getData().parameters.length.toString() : '0', cellClick: (_, cell) => this.$emit('edit-instruction-command', cell.getRow().getData()) },
    { title: 'Help URI (i.e. https://www.visualcal.com/help/drivers/mycustomdriver/mycustomcommand)', field: 'helpUri', editable: this.getIsResponseDataTypeEditable, editor: 'input' }
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
          this.$emit('instruction-removed', row.getData() as CustomInstruction);
        }
      }
    ];
    return menu;
  }

  private createTable() {
    if (this.fTable) return this.fTable;
    const table = new Tabulator(this.tableElement, {
      layout: 'fitDataStretch',
      columns: this.columns,
      movableRows: true,
      rowContextMenu: this.createRowContextMenu(),
      cellEdited: (cell) => {
        const instruction = cell.getRow().getData() as CustomInstruction;
        this.$emit('instruction-updated', instruction);
        this.table.redraw();
      },
      rowMoved: () => { this.reorderInstructions(table); }
    });
    this.fTable = table;
    return table;
  }

  mounted() {
    this.createTable();
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
    const customInstruction: CustomInstruction = {
      ...instruction,
      id: uuid(),
      readAttempts: 1,
      order: -1
    }
    await this.table.addData([customInstruction]);
    this.$emit('instruction-added', customInstruction);
  }

  async addNewInstruction() {
    const newInstruction: CustomInstruction = {
      id: uuid(),
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

</style>
