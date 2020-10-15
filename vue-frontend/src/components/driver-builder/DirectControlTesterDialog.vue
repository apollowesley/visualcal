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
          <div ref="tableElement" />
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

  private fTable?: Tabulator;
  isTesting = false;
  responses: InstructionResponse[] = [];

  private columns: Tabulator.ColumnDefinition[] = [
    { title: 'Command', field: 'instruction.command' },
    { title: 'Type', field: 'instruction.type' },
    { title: 'Response', field: 'response', formatter: (cell) => cell.getValue() === undefined ? '<div style="height: 100%; width: 100%; background-color: grey" />' : cell.getValue() }
  ]

  get tableElement() { return this.$refs.tableElement as HTMLDivElement; }
  get table() {
    if (!this.fTable) this.fTable = this.createTable();
    return this.fTable;
  }

  get instructionSetName() { return this.instructionSet ? this.instructionSet.name : ''; }

  get isCommunicationInterfaceConnected() { return this.$store.direct.state.driverBuilder.isSelectedCommunicationInterfaceConnected; }

  private createTable() {
    if (this.fTable) return this.fTable;
    const table = new Tabulator(this.tableElement, {
      layout: 'fitDataStretch',
      columns: this.columns,
      maxHeight: '500px'
    });
    this.fTable = table;
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
        await this.table.setData(this.responses);
      } catch (error) {
        alert(error.message);
      }
    }
  }

  async onTestInstruction(instruction: CustomInstruction, toggleIsTesting = true) {
    if (toggleIsTesting) this.isTesting = true;
    const command = new TextEncoder().encode(instruction.command);
    let response: ArrayBufferLike | undefined = undefined;
    let responseString = '';
    switch (instruction.type) {
      case 'Write':
        await this.$store.direct.dispatch.driverBuilder.write(command);
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
    this.table.clearData();
  }

}
</script>

<style>

</style>