<template>
  <v-dialog
    :value="shouldShow"
    persistent
    max-width="75%"
  >
    <v-container fluid class="grey">
      <v-row>
        <v-col class="text-center">
          <h4>Command builder</h4>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn color="primary" class="ma-2" @click="addNewCommandPart">
            Add
          </v-btn>
        </v-col>
      </v-row>
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

  @Watch('shouldShow', { immediate: true })
  async onInstructionChanged() {
    if (!this.shouldShow) return;
    // If we have an array of InstructionCommandPart, the we use the instruction.command.  Otherwise we create a new array with a main using the existing command text
    const commandParts = Array.isArray(this.instruction.command) ? this.instruction.command : [{ type: 'main', text: this.instruction.command }];
    while (!this.$refs.commandBuilderTableElement) await this.$nextTick();
    await this.table.setData(commandParts);
  }

  get tableElement() { return this.$refs.commandBuilderTableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  private getCommandPartFromCell(cell: Tabulator.CellComponent) { return cell.getRow().getData() as InstructionCommandPart; }

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
    { title: 'Type*', field: 'type' },
    { title: 'Text*', field: 'text', editable: true, editor: 'input', validator: 'required', minWidth: 400 },
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

  async addNewCommandPart() {
    const newPart: InstructionCommandPart = {
      type: 'parameter',
      text: ''
    };
    await this.table.addData([newPart]);
  }

  onSaveClicked() {
    this.$emit('save', this.instruction, this.table.getData() as InstructionCommandPart[]);
  }

}
</script>

<style>

</style>
