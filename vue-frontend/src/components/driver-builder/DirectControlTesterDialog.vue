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
          Command parameter arguments
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
          <div ref="responsesTable" />
        </v-col>
      </v-row>
    </v-container>
  </v-dialog>
</template>

<script lang="ts">
import { CommandParameter, CommandParameterArgument, CustomInstruction, InstructionSet } from '@/driver-builder';
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';

interface InstructionParameterArgument {
  instruction: CustomInstruction;
  parameter: CommandParameter;
  value: string | number | boolean;
}

interface InstructionResponse {
  instruction: CustomInstruction;
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

  private commandArgumentsTableColumns: Tabulator.ColumnDefinition[] = [
    { title: 'Command', field: 'instruction.command' },
    { title: 'Parameter', field: 'parameter.prompt' },
    { title: 'Value', field: 'value', editable: true, editor: 'input' }
  ]

  private responsesTableColumns: Tabulator.ColumnDefinition[] = [
    { title: 'Command', field: 'instruction.command' },
    { title: 'Type', field: 'instruction.type' },
    { title: 'Response', field: 'response', formatter: (cell) => cell.getValue() === undefined ? '<div style="height: 100%; width: 100%; background-color: grey" />' : cell.getValue() }
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
    this.fCommandArgumentsTable = table;
    return table;
  }

  private createResponsesTable() {
    if (this.fResponsesTable) return this.fResponsesTable;
    const table = new Tabulator(this.responsesTableElement, {
      layout: 'fitDataStretch',
      columns: this.responsesTableColumns,
      maxHeight: '500px'
    });
    this.fResponsesTable = table;
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
            instruction: instruction,
            response: response
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

  async onTestInstruction(instruction: CustomInstruction, toggleIsTesting = true) {
    if (toggleIsTesting) this.isTesting = true;
    let response: ArrayBufferLike | undefined = undefined;
    let responseString = '';
    let commandArguments: CommandParameterArgument[] | undefined = undefined;
    switch (instruction.type) {
      case 'Write':
        commandArguments = (this.commandArgumentsTable.getData() as InstructionParameterArgument[]).filter(i => i.instruction.id === instruction.id).map(i => {
          return {
            parameter: i.parameter,
            value: i.value
          }
        })
        await this.$store.direct.dispatch.driverBuilder.write({ instruction: instruction, arguments: commandArguments });
        if (toggleIsTesting) this.isTesting = false;
        return undefined;
      case 'Read':
        response = await this.$store.direct.dispatch.driverBuilder.read();
        responseString = new TextDecoder().decode(response);
        if (toggleIsTesting) this.isTesting = false;
        return responseString;
      case 'Query':
        responseString = await this.$store.direct.dispatch.driverBuilder.queryString(instruction.command);
        if (toggleIsTesting) this.isTesting = false;
        return responseString;
    }
    if (toggleIsTesting) this.isTesting = false;
    return undefined;
  }

  onClearResponses() {
    this.responses = [];
    this.responsesTable.clearData();
  }

  @Watch('shouldShow')
  async onShouldShowChanged() {
    if (!this.shouldShow) return;
    const parameters: InstructionParameterArgument[] = [];
    for (const instruction of this.instructionSet.instructions) {
      if (instruction.parameters) {
        for (const parameter of instruction.parameters) {
          parameters.push({
            instruction: instruction,
            parameter: parameter,
            value: ''
          })
        }
      }
    }
    await this.commandArgumentsTable.setData(parameters);
  }

  @Watch('instructionSet')
  async onInstructionSetChanged() {
    if (!this.shouldShow || !this.$refs.commandArgumentsTableElement) return;
    await this.commandArgumentsTable.setData(this.instructionSet.instructions.filter(i => i.parameters !== undefined).map(i => {
      return { instruction: i };
    }));
  }

}
</script>

<style>

</style>