<template>
  <v-dialog
    :value="shouldShow"
    max-width="75%"
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
import { CustomInstruction, InstructionSet } from '@/driver-builder';
import {Vue, Component, Prop} from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';

interface InstructionResponse {
  instruction: CustomInstruction;
  response?: string | ArrayBufferLike;
}

@Component
export default class DirectControlTesterDialog extends Vue {

  @Prop({ type: Boolean, required: true }) shouldShow!: boolean; // Toggle show dialog
  @Prop({ type: Object, required: true }) instructionSet!: InstructionSet;

  private fResponsesTable?: Tabulator;
  isTesting = false;
  responses: InstructionResponse[] = [];

  private columns: Tabulator.ColumnDefinition[] = [
    { title: 'Command', field: 'instruction.command' },
    { title: 'Type', field: 'instruction.type' },
    { title: 'Response', field: 'response', formatter: (cell) => cell.getValue() === undefined ? '<div style="height: 100%; width: 100%; background-color: grey" />' : cell.getValue() }
  ]

  get responsesTableElement() { return this.$refs.responsesTable as HTMLDivElement; }
  get responsesTable() {
    if (!this.fResponsesTable) this.fResponsesTable = this.createResponsesTable();
    return this.fResponsesTable;
  }

  get instructionSetName() { return this.instructionSet ? this.instructionSet.name : ''; }

  get isCommunicationInterfaceConnected() { return this.$store.direct.state.driverBuilder.isSelectedCommunicationInterfaceConnected; }

  private createResponsesTable() {
    if (this.fResponsesTable) return this.fResponsesTable;
    const table = new Tabulator(this.responsesTableElement, {
      layout: 'fitDataStretch',
      columns: this.columns,
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
    switch (instruction.type) {
      case 'Write':
        await this.$store.direct.dispatch.driverBuilder.write({ instruction: instruction });
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

}
</script>

<style>

</style>