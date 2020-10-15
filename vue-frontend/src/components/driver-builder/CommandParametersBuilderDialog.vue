<template>
  <v-dialog
    :value="shouldShow"
    persistent
    max-width="75%"
  >
    <v-container fluid class="grey">
      <v-row>
        <v-col class="text-center">
          <h4>Instruction Command Parameter Builder</h4>
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
import { CustomInstruction, CommandParameter } from '@/driver-builder';

@Component
export default class CommandParametersBuilderDialogComponent extends Vue {

  @Prop({ type: Boolean, required: true }) shouldShow!: boolean; // Toggle show dialog
  @Prop({ type: Object, required: true }) instruction!: CustomInstruction;

  private fTable?: Tabulator;

  @Watch('shouldShow', { immediate: true })
  async onInstructionChanged() {
    if (!this.shouldShow) return;
    // If we have an array of InstructionCommandPart, the we use the instruction.command.  Otherwise we create a new array with a main using the existing command text
    const parameters: CommandParameter[] = (this.instruction.parameters) ? this.instruction.parameters : [];
    while (!this.$refs.commandBuilderTableElement) await this.$nextTick(); // TODO: Find a better way to wait for table $ref to exist
    await this.table.setData(parameters);
  }

  get tableElement() { return this.$refs.commandBuilderTableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  private getParameterTypeEditorParams(): Tabulator.SelectParams {
    return {
      values: {
        boolean: 'Boolean',
        number: 'Number',
        string: 'String',
        list: 'List'
      }
    };
  }

  private getParameterFromCell(cell: Tabulator.CellComponent) { return cell.getRow().getData() as CommandParameter; }

  private async updateParameter(cell: Tabulator.CellComponent) {
    const parameter = this.getParameterFromCell(cell);
    await this.table.updateData([parameter]);
    this.table.redraw(true);
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
    { title: 'Parameter Type*', field: 'type', editable: true, editor: 'select', editorParams: this.getParameterTypeEditorParams, cellEdited: this.updateParameter },
    { title: 'Prompt*', field: 'prompt', editable: true, editor: 'input', validator: 'required', minWidth: 400 },
    { title: 'Text Before', field: 'beforeText', editable: true, editor: 'input' },
    { title: 'Text After', field: 'afterText', editable: true, editor: 'input' },
    { title: 'Description', field: 'description', editable: true, editor: 'input' }
  ]

  private createRowContextMenu(): (Tabulator.MenuObject<Tabulator.RowComponent> | Tabulator.MenuSeparator)[] {
    const menu: Tabulator.RowContextMenuSignature = [
      {
        label: 'Delete',
        action: (_, row) => {
          this.table.deleteRow(row);
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
      cellEdited: () => { table.redraw(true); },
      rowMoved: () => { this.reorderInstructions(table); },
      rowContextMenu: this.createRowContextMenu()
    });
    this.fTable = table;
    return table;
  }

  async addNewCommandPart() {
    const newParameter: CommandParameter = {
      type: 'boolean',
      prompt: ''
    };
    await this.table.addData([newParameter]);
  }

  onSaveClicked() {
    this.$emit('save', this.instruction, this.table.getData() as CommandParameter[]);
  }

}
</script>

<style>

</style>
