<template>
  <v-dialog
    :value="shouldShow"
    max-width="50%"
    persistent
    eager
  >
    <v-container fluid class="grey" style="minHeight: 35vh">
      <v-row>
        <v-col class="text-center">
          <h4>Editing list for command parameter with prompt {{ `"${commandParameter.prompt}"` }}</h4>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            @click="onAddButtonClicked"
          >
            Add
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <h4>Parameter List Options</h4>
          <div ref="tableElement" />
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
import { CommandParameter } from 'visualcal-common/src/driver-builder';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';
import { CommandParameterListItem } from 'visualcal-common/src/driver-builder';
import { v4 as uuid } from 'uuid';

@Component
export default class CommandParameterListBuilderDialog extends Vue {

  @Prop({ type: Boolean, required: true }) shouldShow!: boolean; // Toggle show dialog
  @Prop({ type: Object, required: true }) commandParameter!: CommandParameter;

  private fTable?: Tabulator;

  private columns: Tabulator.ColumnDefinition[] = [
    { title: 'Value', field: 'value', editable: true, editor: 'input' },
    { title: 'Display Text', field: 'text', editable: true, editor: 'input' }
  ]

  get tableElement() { return this.$refs.tableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  @Watch('commandParameter')
  async onCommandParameterChanged() {
    this.table.clearData();
    if (this.commandParameter) this.table.setData(this.commandParameter.listItems);
  }

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
      layout: 'fitColumns',
      columns: this.columns,
      rowContextMenu: this.createRowContextMenu
    });
    this.fTable = table;
    return table;
  }

  async mounted() {
    this.createTable();
    if (this.commandParameter) await this.table.setData(this.commandParameter.listItems);
  }

  async onAddButtonClicked() {
    const newOption: CommandParameterListItem = {
      id: uuid(),
      text: '',
      value: ''
    }
    await this.table.addData([newOption]);
  }

  onSaveClicked() {
    this.$emit('save', this.table.getData());
  }

}
</script>

<style>

</style>
