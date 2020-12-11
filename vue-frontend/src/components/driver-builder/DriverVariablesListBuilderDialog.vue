<template>
  <v-dialog
    :value="value"
    max-width="85%"
    persistent
  >
    <v-container fluid class="grey" style="minHeight: 35vh">
      <v-row>
        <v-col class="text-center">
          <h4>Editing variables for driver {{ driverName }}</h4>
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
          <h4>Variables</h4>
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
          <v-btn class="ma-2" @click="close">
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
import { DriverVariable } from 'visualcal-common/src/driver-builder';
import { generateUuid } from '../../utils/uuid';

@Component
export default class DriverVariablesListBuilderDialog extends Vue {

  @Prop({ type: Boolean, required: true }) value!: boolean; // Toggle show dialog

  @Watch('value')
  async onValueChanged(newValue: boolean) {
    this.table.clearData();
    if (!newValue || !this.driver.variables) return;
    const driverVariablesCopy: DriverVariable[] = [];
    this.driver.variables.forEach(variable => {
      driverVariablesCopy.push({
        _id: variable._id,
        name: variable.name,
        defaultValue: variable.defaultValue
      });
    });
    await this.table.setData(driverVariablesCopy);
  }

  private fTable?: Tabulator;

  private columns: Tabulator.ColumnDefinition[] = [
    { title: '', rowHandle: true, formatter: 'handle', headerSort: false, frozen: true, width: 30, minWidth: 30, resizable: false },
    { title: 'Name', field: 'name', editable: true, editor: 'input' },
    { title: 'Default Value', field: 'defaultValue', editable: true, editor: 'input' }
  ]

  get tableElement() { return this.$refs.tableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  get driver() { return this.$store.direct.state.driverBuilder.currentDriver; }
  get driverName() { return `${this.driver.driverManufacturer} ${this.driver.driverModel}`; }
  get variables() { return this.table.getData() as DriverVariable[]; }

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
      index: '_id',
      layout: 'fitColumns',
      columns: this.columns,
      rowContextMenu: this.createRowContextMenu()
    });
    this.fTable = table;
    return table;
  }

  async onAddButtonClicked() {
    await this.table.addRow({
      _id: generateUuid(),
      name: '',
      defaultValue: ''
    });
  }

  onSaveClicked() {
    const variables = this.table.getData() as DriverVariable[];
    this.$store.direct.commit.driverBuilder.setCurrentDriverVariables(variables);

    this.close();
  }

  close() {
    this.$emit('input', false);
  }

}
</script>

<style>

</style>
