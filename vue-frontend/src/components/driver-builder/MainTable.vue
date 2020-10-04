<template>
  <v-container fluid class="grey">
    <v-form
      v-model="canSaveForm"
    >
      <v-row no-gutters dense>
        <v-col
          cols="12"
          sm="4"
        >
          <v-text-field
            v-model="driver.manufacturer"
            :rules="rules"
            label="Manufacturer"
          />
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-text-field
            v-model="driver.model"
            :rules="rules"
            label="Model"
          />
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-text-field
            v-model="driver.nomenclature"
            :rules="rules"
            label="Nomenclature"
            hint="Instrument class or description"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-checkbox
            v-model="driver.identifiable"
            label="Identifiable?"
          />
        </v-col>
        <v-col
          v-if="driver.identifiable"
        >
          <v-text-field
            v-model="driver.identityQueryCommand"
            :rules="driver.identifiable ? rules : []"
            label="Identity Query Command"
            hint="Command sent to instrument to ask it for it's identity"
          />
        </v-col>
        <v-col>
          <v-checkbox
            v-model="driver.isGpib"
            label="Has a GPIB interface?"
          />
        </v-col>
        <v-col>
          <v-select
            v-model="driver.terminator"
            :rules="rules"
            :items="['None', 'Carriage return', 'Line feed', 'Carriage return / Line feed']"
            label="Terminator"
            hint="Character(s) used to signal the end of a read/write"
          />
        </v-col>
      </v-row>
    </v-form>
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
import { requiredRule, VuetifyRule } from '@/utils/vuetify-input-rules';
import { CustomInstruction, Driver } from '@/driver-builder';

const MockInstructions: CustomInstruction[] = [
  { id: uuid(), order: 0, name: 'Identification Query', type: 'Query', responseDataType: 'String', delayAfter: 500, readAttempts: 2, command: '*IDN?' },
  { id: uuid(), order: 1, name: 'Measure volts AC', type: 'Query', responseDataType: 'Number', delayAfter: 500, readAttempts: 2, command: 'MEAS:VOLT:AC? $optArg1,$optArg2' },
  { id: uuid(), order: 2, name: 'Measure volts DC', type: 'Query', responseDataType: 'Number', delayAfter: 500, readAttempts: 2, command: 'MEAS:VOLT:DC? $optArg1,$optArg2' }
];

const MockDriver: Driver = {
  manufacturer: 'Keysight',
  model: '34401A',
  nomenclature: 'Digital Multimeter',
  identifiable: true,
  identityQueryCommand: '*IDN?',
  isGpib: true,
  terminator: 'Line feed'
};

@Component
export default class MainTableComponent extends Vue {

  private fTable?: Tablulator;
  rules: VuetifyRule[] = [
    requiredRule
  ];
  canSaveForm = false;
  driver: Driver = process.env.NODE_ENV === 'production' ? {
    manufacturer: '',
    model: '',
    nomenclature: '',
    identifiable: false,
    identityQueryCommand: '*IDN?',
    isGpib: false,
    terminator: 'None'
  } : MockDriver;

  get tableElement() { return this.$refs.tableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  private getInstructionFromCell(cell: Tablulator.CellComponent) { return cell.getRow().getData() as CustomInstruction; }

  private getIsResponseDataTypeEditable(cell: Tablulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    return instruction.type === 'Read' || instruction.type === 'Query';
  }

  private getIsCommandEditable(cell: Tablulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    if (instruction.type === 'Read') return false;
    return true;
  }

  private getIsReadAttemptsEditable(cell: Tablulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    return instruction.type === 'Read' || instruction.type === 'Query';
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

  private formatReadAttemptsCell(cell: Tablulator.CellComponent) {
    const isEditable = this.getIsReadAttemptsEditable(cell);
    const div = document.createElement('div') as HTMLDivElement;
    div.style.backgroundColor = isEditable ? '' :'#b5b5b5';
    div.style.height = '100%';
    div.style.width = '100%';
    if (isEditable) div.innerText = cell.getValue();
    return div;
  }

  private reorderInstructions(table: Tablulator) {
    const rows = table.getRows();
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const instruction = row.getData() as CustomInstruction;
      instruction.order = index;
    }
    table.redraw(true);
  }

  private columns: Tablulator.ColumnDefinition[] = [
    { title: '', rowHandle: true, formatter: 'handle', headerSort: false, frozen: true, width: 30, minWidth: 30 },
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
    { title: 'Command*', field: 'command', editable: this.getIsResponseDataTypeEditable, editor: 'input', validator: 'required' },
    { title: 'Help URI (i.e. https://www.visualcal.com/help/drivers/mycustomdriver/mycustomcommand)', field: 'helpUri', editable: this.getIsResponseDataTypeEditable, editor: 'input' },
  ]

  private createTable() {
    const table = new Tablulator(this.tableElement, {
      layout: 'fitDataStretch',
      columns: this.columns,
      movableRows: true,
      cellEdited: () => { table.redraw(true); },
      rowMoved: () => { this.reorderInstructions(table); }
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
