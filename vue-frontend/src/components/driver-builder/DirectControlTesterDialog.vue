<template>
  <v-dialog
    :value="shouldShow"
    max-width="75%"
    persistent
    eager
  >
    <v-container fluid class="grey text-center" style="height: 65vh">
      <v-row>
        <v-col class="text-center">
          <h4>Testing Instruction Set - {{ instructionSetName }}</h4>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <h4>Command parameter arguments</h4>
          <div ref="commandArgumentsTable" />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          offset="5"
        >
          <v-btn
            :disabled="!isCommunicationInterfaceConnected || instructionSet.instructions.length <= 0"
            color="primary"
            class="mr-3"
            max-width="100"
            @click.native.stop="onTestInstructionSetButtonClicked(instructionSet)"
          >
            {{ isTesting ? 'Stop' : 'Test' }}
          </v-btn>
          <v-btn class="ma-2" @click="onClearResponses">
            Clear
          </v-btn>
          <v-btn class="ma-2" @click="$emit('cancel')">
            Close
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <h4>Responses</h4>
          <div ref="responsesTable" />
        </v-col>
      </v-row>
    </v-container>
  </v-dialog>
</template>

<script lang="ts">
import { CommandParameter, CommandParameterArgument, Instruction, InstructionSet, Driver } from 'visualcal-common/src/driver-builder';
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';
import { checkboxEditor, numberEditor, stringEditor } from '@/utils/tabulator-helpers';

interface InstructionParameterArgument {
  instruction: Instruction;
  parameter: CommandParameter;
  value: string | number | boolean;
}

interface InstructionResponse {
  timestamp: string;
  instruction: Instruction;
  command: string;
  response?: string | ArrayBufferLike;
}

@Component
export default class DirectControlTesterDialog extends Vue {

  @Prop({ type: Boolean, required: true }) shouldShow!: boolean; // Toggle show dialog
  @Prop({ type: Object, required: true }) instructionSet!: InstructionSet;

  private fResponsesTable?: Tabulator;
  private fCommandArgumentsTable?: Tabulator;
  isTesting = false;
  responses: InstructionResponse[] = [];

  private getCommandParameterEditor(cell: Tabulator.CellComponent, onRendered: Tabulator.EmptyCallback, success: Tabulator.ValueBooleanCallback, cancel: Tabulator.ValueVoidCallback) {
    const argument = cell.getRow().getData() as InstructionParameterArgument;
    let editor: HTMLElement;
    let driver: Driver;
    let availableReadResponseInstructions: Instruction[];
    switch (argument.parameter.type) {
      case 'string':
        editor = stringEditor(cell, onRendered, success, cancel);
        break;
      case 'number':
        editor = numberEditor(cell, onRendered, success, cancel);
        break;
      case 'boolean':
        editor = checkboxEditor(cell, onRendered, success, cancel);
        break;
      case 'list':
        editor = document.createElement('select');
        if (argument.parameter.listItems) {
          for (let index = 0; index < argument.parameter.listItems.length; index++) {
            const item = argument.parameter.listItems[index];
            const newOption = document.createElement('option');
            newOption.selected = index === 0;
            newOption.label = item.text;
            newOption.value = item.value;
            (editor as HTMLSelectElement).options.add(newOption);
          }
        }
        (editor as HTMLSelectElement).onchange = () => {
          const selectedOption = (editor as HTMLSelectElement).options[(editor as HTMLSelectElement).selectedIndex];
          if (selectedOption) {
            success(selectedOption.value);
          }
        }
        (editor as HTMLSelectElement).onblur = () => {
          const selectedOption = (editor as HTMLSelectElement).options[(editor as HTMLSelectElement).selectedIndex];
          if (selectedOption) {
            success(selectedOption.value);
          }
        }
        break;
      case 'readResponse':
        editor = document.createElement('select');
        availableReadResponseInstructions = [];
        for (let index = 0; index < this.instructionSet.instructions.length; index++) {
          const instruction = this.instructionSet.instructions[index];
          if (instruction._id === argument.instruction._id) continue;
          availableReadResponseInstructions.push(instruction);
        }
        for (let index = 0; index < availableReadResponseInstructions.length; index++) {
          const instruction = availableReadResponseInstructions[index];
          const newOption = document.createElement('option');
          newOption.selected = index === 0;
          newOption.label = `&{instruction.name} ${instruction.responseName || '<Unknown Response Tag>'}`;
          newOption.value = instruction._id;
          (editor as HTMLSelectElement).options.add(newOption);
        }
        break;
      case 'variable':
        editor = document.createElement('select');
        driver = this.$store.direct.state.driverBuilder.currentDriver;
        if (!driver.variables) break;
        for (let index = 0; index < driver.variables.length; index++) {
          const variable = driver.variables[index];
          const newOption = document.createElement('option');
          newOption.selected = index === 0;
          newOption.label = variable.name;
          newOption.value = variable._id;
          (editor as HTMLSelectElement).options.add(newOption);
        }
        break;
    }
    if (editor) {
      editor.style.padding = '3px';
      editor.style.width = '100%';
      editor.style.boxSizing = 'border-box';
    }

    return editor;
  }

  private commandArgumentsTableColumns: Tabulator.ColumnDefinition[] = [
    { title: 'Command', field: 'instruction.command' },
    { title: 'Parameter', field: 'parameter.prompt' },
    { title: 'Value', field: 'value', editable: true, editor: this.getCommandParameterEditor }
  ]

  private responsesTableColumns: Tabulator.ColumnDefinition[] = [
    { title: 'Timestamp', field: 'timestamp' },
    { title: 'Command', field: 'command' },
    { title: 'Type', field: 'instruction.type' },
    { title: 'Response (string)', field: 'response', formatter: (cell) => cell.getValue() === undefined ? '<div style="height: 100%; width: 100%; background-color: grey" />' : cell.getValue() },
    { title: 'Response (integer from string)', field: 'response', formatter: (cell) => cell.getValue() === undefined ? '<div style="height: 100%; width: 100%; background-color: grey" />' : parseInt(cell.getValue()) },
    { title: 'Response (integer from float)', field: 'response', formatter: (cell) => cell.getValue() === undefined ? '<div style="height: 100%; width: 100%; background-color: grey" />' : parseInt(parseFloat(cell.getValue()).toString()) },
    { title: 'Response (float)', field: 'response', formatter: (cell) => cell.getValue() === undefined ? '<div style="height: 100%; width: 100%; background-color: grey" />' : parseFloat(cell.getValue()) },
    { title: 'Response (boolean)', field: 'response', formatter: (cell) => cell.getValue() === undefined ? '<div style="height: 100%; width: 100%; background-color: grey" />' : !!cell.getValue() }
  ]

  get commandArgumentsTableElement() { return this.$refs.commandArgumentsTable as HTMLDivElement; }
  get commandArgumentsTable() {
    if (!this.fCommandArgumentsTable) this.fCommandArgumentsTable = this.createCommandArgumentsTable();
    return this.fCommandArgumentsTable;
  }

  get responsesTableElement() { return this.$refs.responsesTable as HTMLDivElement; }
  get responsesTable() {
    if (!this.fResponsesTable) this.fResponsesTable = this.createResponsesTable();
    return this.fResponsesTable;
  }

  get instructionSetName() { return this.instructionSet ? this.instructionSet.name : ''; }

  get isCommunicationInterfaceConnected() { return this.$store.direct.state.driverBuilder.isSelectedCommunicationInterfaceConnected; }

  private createCommandArgumentsTable() {
    if (this.fCommandArgumentsTable) return this.fCommandArgumentsTable;
    const table = new Tabulator(this.commandArgumentsTableElement, {
      layout: 'fitDataStretch',
      columns: this.commandArgumentsTableColumns,
      maxHeight: '500px'
    });
    return table;
  }

  private createResponsesTable() {
    if (this.fResponsesTable) return this.fResponsesTable;
    const table = new Tabulator(this.responsesTableElement, {
      layout: 'fitDataStretch',
      columns: this.responsesTableColumns,
      maxHeight: '500px'
    });
    return table;
  }

  async onTestInstructionSetButtonClicked(instructionSet: InstructionSet) {
    if (this.isTesting) {
      this.isTesting = false;
    } else {
      this.isTesting = true;
      try {
        for (const instruction of instructionSet.instructions) {
          const response = await this.onTestInstruction(instruction, false);
          this.responses.push({
            timestamp: new Date().toString(),
            instruction: instruction,
            command: response.command,
            response: response.response
          });
        }
      } catch (error) {
        alert(error.message);
      }
      this.isTesting = false;
      try {
        await this.responsesTable.setData(this.responses);
      } catch (error) {
        alert(error.message);
      }
    }
  }

  async onTestInstruction(instruction: Instruction, toggleIsTesting = true): Promise<InstructionResponse> {
    if (toggleIsTesting) this.isTesting = true;
    let response: ArrayBufferLike | undefined = undefined;
    let responseString = '';
    const retVal: InstructionResponse = {
      timestamp: new Date().toString(),
      instruction: instruction,
      command: '',
      response: undefined
    }
    const commandParameterArgumentsTableData = this.commandArgumentsTable.getData() as InstructionParameterArgument[];
    const thisInstructionCommandParameterArguments = commandParameterArgumentsTableData.filter(i => i.instruction._id === instruction._id);
    const commandArguments: CommandParameterArgument[] = thisInstructionCommandParameterArguments.map(i => {
      return {
        parameter: i.parameter,
        value: i.value
      }
    });
    switch (instruction.type) {
      case 'Write':
        retVal.command = await this.$store.direct.dispatch.driverBuilder.write({ instruction: instruction, parameterArguments: commandArguments });
        if (toggleIsTesting) this.isTesting = false;
        break;
      case 'Read':
        response = await this.$store.direct.dispatch.driverBuilder.read();
        responseString = new TextDecoder().decode(response);
        if (toggleIsTesting) this.isTesting = false;
        retVal.response = responseString;
        break;
      case 'Query':
        responseString = await this.$store.direct.dispatch.driverBuilder.queryString({ instruction: instruction, parameterArguments: commandArguments });
        if (toggleIsTesting) this.isTesting = false;
        retVal.response = responseString;
        break;
    }
    if (toggleIsTesting) this.isTesting = false;
    return retVal;
  }

  onClearResponses() {
    this.responses = [];
    this.responsesTable.clearData();
  }

  @Watch('shouldShow')
  async onShouldShowChanged() {
    if (!this.shouldShow) return;
    const preParameters: InstructionParameterArgument[] = [];
    const postParameters: InstructionParameterArgument[] = [];
    for (const instruction of this.instructionSet.instructions) {
      if (instruction.preParameters) {
        for (const parameter of instruction.preParameters) {
          preParameters.push({
            instruction: instruction,
            parameter: parameter,
            value: ''
          })
        }
      }
      if (instruction.postParameters) {
        for (const parameter of instruction.postParameters) {
          postParameters.push({
            instruction: instruction,
            parameter: parameter,
            value: ''
          })
        }
      }
    }
    await this.commandArgumentsTable.setData([...preParameters, ...postParameters]);
  }

}
</script>

<style>

</style>