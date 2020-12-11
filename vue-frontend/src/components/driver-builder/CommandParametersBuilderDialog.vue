<template>
  <v-dialog
    :value="shouldShow"
    persistent
    max-width="95%"
  >
    <CommandParameterListBuilderDialog
      :should-show="shouldShowCommandParameterListBuilderDialog"
      :command-parameter="parameterForListBuilderDialog"
      @save="onCommandParameterListBuilderDialogSave"
      @cancel="shouldShowCommandParameterListBuilderDialog = false"
    />
    <v-container fluid class="grey" style="height: 65vh">
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
import { CommandParameter, CommandParameterType, Instruction } from 'visualcal-common/src/driver-builder';
import CommandParameterListBuilderDialog from '@/components/driver-builder/CommandParameterListBuilderDialog.vue';
import { generateUuid } from '@/utils/uuid';
import { checkboxEditor, numberEditor, stringEditor } from '@/utils/tabulator-helpers';
import { CommandParameterListItem } from 'visualcal-common/src/driver-builder';

@Component({
  components: {
    CommandParameterListBuilderDialog
  }
})
export default class CommandParametersBuilderDialogComponent extends Vue {

  @Prop({ type: Boolean, required: true }) shouldShow!: boolean; // Toggle show dialog
  @Prop({ type: Array, required: false }) instructionsWithReadResponse?: Instruction[];
  @Prop({ type: Object, required: true }) instruction!: Instruction;
  @Prop({ type: Array, required: false }) parameters?: CommandParameter[];
  @Prop({ type: String, required: true }) parametersType!: CommandParameterType;

  get actualParameters() { return this.parameters ? this.parameters : []; }
  get tableElement() { return this.$refs.commandBuilderTableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  private fTable?: Tabulator;
  shouldShowCommandParameterListBuilderDialog = false;
  parameterForListBuilderDialog: CommandParameter = {
    _id: generateUuid(),
    type: 'list',
    prompt: ''
  }

  @Watch('shouldShow', { immediate: true })
  async onShouldShowChanged() {
    if (!this.shouldShow) return;
    // If we have an array of InstructionCommandPart, the we use the instruction.command.  Otherwise we create a new array with a main using the existing command text
    while (!this.$refs.commandBuilderTableElement) await this.$nextTick(); // TODO: Find a better way to wait for table $ref to exist
    await this.table.setData(this.actualParameters);
  }

  private getParameterTypeEditorParams(): Tabulator.SelectParams {
    return {
      values: {
        boolean: 'Boolean',
        number: 'Number',
        string: 'String',
        list: 'List',
        readResponse: 'Read Response',
        variable: 'Variable'
      }
    };
  }

  private formatParameterTypeField(cell: Tabulator.CellComponent)  {
    const value = cell.getValue() as string;
    const divEl = document.createElement('div');
    switch (value) {
      case 'boolean':
        divEl.innerText = 'Boolean';
        break;
      case 'number':
        divEl.innerText = 'Number';
        break;
      case 'string':
        divEl.innerText = 'String';
        break;
      case 'list':
        divEl.innerText = 'List';
        break;
      case 'readResponse':
        divEl.innerText = 'Read Response';
        break;
      case 'variable':
        divEl.innerText = 'Variable';
        break;
    }
    return divEl;
  }

  private getParameterFromCell(cell: Tabulator.CellComponent) { return cell.getRow().getData() as CommandParameter; }

  private async updateParameter(cell: Tabulator.CellComponent) {
    const parameter = this.getParameterFromCell(cell);
    await this.table.updateData([parameter]);
    this.table.redraw(true);
  }

  private formatListOrReadResponseOrVariableCell(cell: Tabulator.CellComponent) {
    const parameter = cell.getRow().getData() as CommandParameter;
    let availableReadResponseInstructions: Instruction[];
    if (parameter.type === 'readResponse') {
      const selectElement = document.createElement('select');
      if (!this.instructionsWithReadResponse) return selectElement;
      availableReadResponseInstructions = [];
      for (let index = 0; index < this.instructionsWithReadResponse.length; index++) {
        const instruction = this.instructionsWithReadResponse[index];
        if (instruction._id === this.instruction._id) break;
        if (instruction.responseName) availableReadResponseInstructions.push(instruction);
      }
      for (let index = 0; index < availableReadResponseInstructions.length; index++) {
        const instruction = availableReadResponseInstructions[index];
        const newOption = document.createElement('option');
        newOption.selected = index === 0;
        newOption.label = `${instruction.responseName || '<Unknown Tag>'}`;
        newOption.value = instruction._id;
        selectElement.options.add(newOption);
        if (parameter.readResponseTag === undefined && index === 0) parameter.readResponseTag = instruction.responseName;
      }
      return selectElement;
    } else if (parameter.type === 'list') {
      const buttonElement = document.createElement('button');
      buttonElement.classList.add('tabulator-cell-button');
      buttonElement.innerText = 'Edit List';
      buttonElement.addEventListener('click', (e) => {
        e.preventDefault();
        this.parameterForListBuilderDialog = parameter;
        this.shouldShowCommandParameterListBuilderDialog = true;
      });
      return buttonElement;
    } else if (parameter.type === 'variable') {
      const selectElement = document.createElement('select');
      const currentDriver = this.$store.direct.state.driverBuilder.currentDriver;
      if (!currentDriver.variables) return selectElement;
      for (let index = 0; index < currentDriver.variables.length; index++) {
        const variable = currentDriver.variables[index];
        const newOption = document.createElement('option');
        newOption.selected = index === 0;
        newOption.label = variable.name;
        newOption.value = variable._id;
        selectElement.options.add(newOption);
        if (parameter.variableName === undefined && index === 0) parameter.variableName = variable.name;
      }
      return selectElement;
    }
    const div = document.createElement('div') as HTMLDivElement;
    div.style.backgroundColor = 'silver';
    div.style.height = '100%';
    div.style.width = '100%';
    return div;
  }

  getCommandParameterFromCell(cell: Tabulator.CellComponent) {
    return cell.getRow().getData() as CommandParameter;
  }

  isBoolean(cell: Tabulator.CellComponent) {
    const parameter = this.getParameterFromCell(cell);
    return parameter.type === 'boolean';
  }

  isString(cell: Tabulator.CellComponent) {
    const parameter = this.getParameterFromCell(cell);
    return parameter.type === 'string';
  }

  isNumber(cell: Tabulator.CellComponent) {
    const parameter = this.getParameterFromCell(cell);
    return parameter.type === 'number';
  }

  isList(cell: Tabulator.CellComponent) {
    const parameter = this.getParameterFromCell(cell);
    return parameter.type === 'list';
  }

  createFormatterDiv(editable: boolean) {
    const div = document.createElement('div') as HTMLDivElement;
    if (!editable) div.style.backgroundColor = 'silver';
    div.style.width = '100%';
    div.style.height = '100%';
    return div;
  }

  getBooleanFormatter(cell: Tabulator.CellComponent) {
    const isBoolean = this.isBoolean(cell);
    const div = this.createFormatterDiv(isBoolean);
    if (isBoolean) div.innerText = cell.getValue();
    return div;
  }

  getNumberTypeBooleanFormatter(cell: Tabulator.CellComponent) {
    const isNumber = this.isNumber(cell);
    const div = this.createFormatterDiv(isNumber);
    if (isNumber) div.innerText = cell.getValue();
    return div;
  }

  getTextBeforeAfterFormatter(cell: Tabulator.CellComponent) {
    const value = cell ? cell.getValue() as string : '';
    const div = this.createFormatterDiv(true);
    div.innerText = value ? value.replaceAll(' ', '<space>') : '';
    return div;
  }

  formatPromptCell(cell: Tabulator.CellComponent) {
    const parameter = this.getParameterFromCell(cell);
    const div = this.createFormatterDiv(parameter.type !== 'variable' && parameter.type !== 'readResponse');
    div.innerText = parameter.prompt;
    return div;
  }

  getDefaultValueEditor(cell: Tabulator.CellComponent, onRendered: Tabulator.EmptyCallback, success: Tabulator.ValueBooleanCallback, cancel: Tabulator.ValueVoidCallback) {
    const parameter = this.getParameterFromCell(cell);
    if (parameter.type === 'boolean') return checkboxEditor(cell, onRendered, success, cancel);
    if (parameter.type === 'number') return numberEditor(cell, onRendered, success, cancel);
    return stringEditor(cell, onRendered, success, cancel);
  }

  async onParameterTypeDependantFieldEdited(cell: Tabulator.CellComponent) {
    const parameter = this.getParameterFromCell(cell);
    const typeDependantColumn = this.table.getColumns(false).find(c => c.getDefinition().title === 'Type Dependant');
    if (!typeDependantColumn) return;
    const typeDependantCell = cell.getRow().getCell(typeDependantColumn);
    if (parameter.type === 'readResponse') {
      const readResponseTag = typeDependantCell.getValue() as string;
      console.info(readResponseTag);
      parameter.readResponseTag = readResponseTag;
    } else if (parameter.type === 'variable') {
      const variableName = typeDependantCell.getValue() as string;
      console.info(variableName);
      parameter.variableName = variableName;
    }
    await this.table.updateData([parameter]);
  }

  private columns: Tabulator.ColumnDefinition[] = [
    { title: '', rowHandle: true, formatter: 'handle', headerSort: false, frozen: true, width: 30, minWidth: 30, resizable: false },
    { title: 'Parameter Type*', field: 'type', formatter: this.formatParameterTypeField, editable: true, editor: 'select', editorParams: this.getParameterTypeEditorParams, cellEdited: this.updateParameter },
    { title: 'Type Dependant', formatter: this.formatListOrReadResponseOrVariableCell, cellEdited: this.onParameterTypeDependantFieldEdited },
    { title: 'Prompt (Not used if type is Variable)', field: 'prompt', formatter: this.formatPromptCell, editable: true, editor: 'input', validator: 'required', minWidth: 400 },
    { title: 'Text Before', field: 'beforeText', editable: true, editor: 'input', formatter: this.getTextBeforeAfterFormatter },
    { title: 'Text After', field: 'afterText', editable: true, editor: 'input', formatter: this.getTextBeforeAfterFormatter },
    { title: 'Default Value', field: 'default', editable: true, editor: this.getDefaultValueEditor },
    { title: 'Boolean Value', columns: [
      { title: 'False', field: 'falseValue', editable: this.isBoolean, editor: 'input', formatter: this.getBooleanFormatter },
      { title: 'True', field: 'trueValue', editable: this.isBoolean, editor: 'input', formatter: this.getBooleanFormatter }
    ]},
    { title: 'Numeric Range', columns: [
      { title: 'Use Minimum?', field: 'useMin', editable: this.isNumber, editor: 'tickCross', formatter: this.getNumberTypeBooleanFormatter },
      { title: 'Minimum', field: 'min', editable: this.isNumber, editor: 'input', formatter: this.getNumberTypeBooleanFormatter, accessor: (value) => Number(value) },
      { title: 'Use Maximum?', field: 'useMax', editable: this.isNumber, editor: 'tickCross', formatter: this.getNumberTypeBooleanFormatter },
      { title: 'Maximum', field: 'max', editable: this.isNumber, editor: 'input', formatter: this.getNumberTypeBooleanFormatter, accessor: (value) => Number(value) },
      { title: 'Use Increment?', field: 'useMinMaxIncrement', editable: this.isNumber, editor: 'tickCross', formatter: this.getNumberTypeBooleanFormatter },
      { title: 'Increment', field: 'minMaxIncrement', editable: this.isNumber, editor: 'input', formatter: this.getNumberTypeBooleanFormatter, accessor: (value) => Number(value) },
    ] },
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
      index: '_id',
      layout: 'fitDataStretch',
      columns: this.columns,
      headerSort: false,
      movableRows: true,
      cellEdited: () => { table.redraw(true); },
      // rowMoved: () => { this.reorderInstructions(table); },
      rowContextMenu: this.createRowContextMenu()
    });
    this.fTable = table;
    return table;
  }

  async addNewCommandPart() {
    const newParameter: CommandParameter = {
      _id: generateUuid(),
      type: 'boolean',
      prompt: '',
      default: false,
      trueValue: '1',
      falseValue: '0',
      useMin: false,
      min: Number.MIN_SAFE_INTEGER,
      useMax: false,
      max: Number.MAX_SAFE_INTEGER,
      useMinMaxIncrement: false,
      minMaxIncrement: 1
    };
    await this.table.addData([newParameter]);
  }

  onSaveClicked() {
    this.$emit('save', { parameters: this.table.getData() as CommandParameter[], parametersType: this.parametersType });
  }

  onCommandParameterListBuilderDialogSave(items: CommandParameterListItem[]) {
    this.shouldShowCommandParameterListBuilderDialog = false;
    this.parameterForListBuilderDialog.listItems = items;
  }

}
</script>

<style>
.tabulator-cell-button {
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.16, rgb(207, 207, 207)), color-stop(0.79, rgb(252, 252, 252)));
  background-image: -moz-linear-gradient(center bottom, rgb(207, 207, 207) 16%, rgb(252, 252, 252) 79%);
  background-image: linear-gradient(to top, rgb(207, 207, 207) 16%, rgb(252, 252, 252) 79%); 
  padding: 3px;
  border: 1px solid #000;
  color: black;
  text-decoration: none;
  width: 100%
}
</style>
