<template>
  <v-dialog
    :value="shouldShow"
    persistent
  >
    <v-container fluid class="grey">
      <v-row no-gutters>
        <v-col
          class="text-center"
        >
          <div ref="commandBuilderTableElement" />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          offset="5"
        >
          <v-btn color="primary" class="ma-2" @click="onSaveClicked">
            Save
          </v-btn>
          <v-btn class="ma-2" @click="$emit('cancel')">
            Cancel
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';
import { v4 as uuid } from 'uuid';
import { CustomInstruction, InstructionCommandPart } from '@/driver-builder';

@Component
export default class CommandBuilderComponent extends Vue {

  @Prop({ type: Boolean, required: true }) shouldShow!: boolean; // Toggle show dialog
  @Prop({ type: Object, required: true }) instruction!: CustomInstruction;

  private fTable?: Tabulator;
  commandParts: InstructionCommandPart[] = [];

  @Watch('instruction')
  async onInstructionChanged() {
    // If we have an array of InstructionCommandPart, the we use the instruction.command.  Otherwise we create a new array with a main using the existing command text
    this.commandParts = Array.isArray(this.instruction.command) ? this.instruction.command : [{ type: 'main', text: this.instruction.command }];
    await this.table.setData(this.commandParts);
  }

  get tableElement() { return this.$refs.commandBuilderTableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  private getInstructionFromCell(cell: Tabulator.CellComponent) { return cell.getRow().getData() as CustomInstruction; }

  private getIsCommandEditable(cell: Tabulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    if (instruction.type === 'Read') return false;
    return true;
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

  private async updateInstruction(cell: Tabulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    await this.table.updateData([instruction]);
    this.table.redraw(true);
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

  private reorderInstructions(table: Tabulator) {
    const rows = table.getRows();
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const instruction = row.getData() as CustomInstruction;
      instruction.order = index;
    }
    table.redraw(true);
  }

  private columns: Tabulator.ColumnDefinition[] = [
    { title: '', rowHandle: true, formatter: 'handle', headerSort: false, frozen: true, width: 30, minWidth: 30, resizable: false },
    { title: 'Type*', field: 'type', editable: true, editor: 'select', editorParams: this.getCommandTypeEditorParams, cellEdited: this.updateInstruction },
    { title: 'Text*', field: 'text', editable: true, editor: 'input', validator: 'required' },
    { title: 'Description', field: 'description', editable: true, editor: 'input' }
  ]

  private createTable() {
    if (this.fTable) return this.fTable;
    const table = new Tabulator(this.tableElement, {
      layout: 'fitDataStretch',
      columns: this.columns,
      movableRows: true,
      cellEdited: () => { table.redraw(true); },
      rowMoved: () => { this.reorderInstructions(table); },
    });
    this.fTable = table;
    return table;
  }

  onSaveClicked() {
    this.$emit('save', this.instruction, this.commandParts);
  }

}
</script>

<style>

</style>
