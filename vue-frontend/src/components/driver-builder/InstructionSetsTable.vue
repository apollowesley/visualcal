<template>
  <div ref="instructionSetsTable" />
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';
import { Instruction } from 'visualcal-common/src/driver-builder';

@Component
/**
 * This component is not currently used.
 * It was originally created to replace Vuetify expanders with a Tabulator table and nested table for instructions.
 * 30-OCT-2020
 */
export default class InstructionSetsTableComponent extends Vue {

  private fInstructionSetsTable?: Tabulator;
  private fColumns: Tabulator.ColumnDefinition[] = [
    { title: 'Instruction Set Name', field: 'name' }
  ]

  get instructionSets() {
    return this.$store.direct.state.driverBuilder.currentDriver.instructionSets;
  }

  get instructionSetsTable() {
    if (this.fInstructionSetsTable) return this.fInstructionSetsTable;
    this.fInstructionSetsTable = new Tabulator(this.$refs.instructionSetsTable as HTMLDivElement, {
      layout: 'fitDataStretch',
      columns: this.fColumns,
      data: this.instructionSets,
      rowFormatter: this.getInstructionSetsTableRowFormatter
    });
    return this.fInstructionSetsTable;
  }

  @Watch('instructionSets')
  async onInstructionSetsChanged() {
    await this.instructionSetsTable.setData(this.instructionSets);
  }

  async mounted() {
    if (!this.$refs.instructionSetsTable) return;
    await this.instructionSetsTable.setData(this.instructionSets);
  }

  private getInstructionFromCell(cell: Tabulator.CellComponent) { return cell.getRow().getData() as Instruction; }

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
    await cell.getTable().updateData([instruction]);
    cell.getTable().redraw(true);
  }

  private getIsResponseDataTypeEditable(cell: Tabulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    return instruction.type === 'Read' || instruction.type === 'Query';
  }

  private getIsReadAttemptsEditable(cell: Tabulator.CellComponent) {
    const instruction = this.getInstructionFromCell(cell);
    return instruction.type === 'Read' || instruction.type === 'Query';
  }

  private formatResponseDataTypeCell(cell: Tabulator.CellComponent) {
    const isEditable = this.getIsResponseDataTypeEditable(cell);
    const div = document.createElement('div') as HTMLDivElement;
    div.style.backgroundColor = isEditable ? '' :'#b5b5b5';
    div.style.height = '100%';
    div.style.width = '100%';
    div.innerText = 'N/A';
    if (isEditable) div.innerText = cell.getValue();
    return div;
  }

  private formatReadAttemptsCell(cell: Tabulator.CellComponent) {
    const isEditable = this.getIsReadAttemptsEditable(cell);
    const div = document.createElement('div') as HTMLDivElement;
    div.style.backgroundColor = isEditable ? '' :'#b5b5b5';
    div.style.height = '100%';
    div.style.width = '100%';
    div.innerText = 'N/A';
    if (isEditable) div.innerText = cell.getValue();
    return div;
  }

  getInstructionSetsTableRowFormatter(row: Tabulator.RowComponent) {
    const holderElement = document.createElement('div') as HTMLDivElement;
    const tableElement = document.createElement('div') as HTMLDivElement;
    holderElement.style.boxSizing = "border-box";
    holderElement.style.padding = "5px";
    holderElement.style.borderTop = "1px solid #333";
    holderElement.style.borderBottom = "1px solid #333";
    holderElement.style.background = 'grey';

    tableElement.style.border = "1px solid #333";
    tableElement.style.display = 'none';
    row.getElement().addEventListener('click', () => {
      if (tableElement.style.display === 'none') {
        tableElement.style.display = 'block';
      } else {
        tableElement.style.display = 'none';
      }
      row.getTable().redraw();
    });
    holderElement.appendChild(tableElement);

    row.getElement().appendChild(holderElement);

    const instructionsTable = new Tabulator(tableElement, {
      layout: 'fitDataStretch',
      movableRows: true,
      columns: [
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
      ],
      data: row.getData().instructions
    });
    return instructionsTable;
  }

}
</script>
