<template>
  <v-container fluid class="grey" style="height: 100vh">
    <CommandParametersBuilderDialogComponent
      :should-show="shouldCommandBuilderDialogShow"
      :instruction="commandBuilderDialogInstruction"
      @save="onCommandParametersBuilderDialogSave"
      @cancel="shouldCommandBuilderDialogShow = false"
    />
    <RenameInstructionSetDialogComponent
      :should-show="shouldRenameInstructionSetDialogShow"
      :instruction-set="selectedRenameInstructionSet"
      @renamed="onInstructionSetRenamed"
      @cancel="shouldRenameInstructionSetDialogShow = false"
    />
    <DirectControlTesterDialog
      :should-show="shouldDirectControlTesterDialogShow"
      :instruction-set="selectedInstructionSetUnderTest"
      eager
      @cancel="shouldDirectControlTesterDialogShow = false"
    />
    <v-row no-gutters>
      <v-col class="text-center">
        <v-row no-gutters>
          <v-col>
            <h2>Driver Builder</h2>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="flex-nowrap" style="height: 96vh; max-height: 96vh;" no-gutters>
      <InstructionsAndTemplatesPanelComponent :items="items" />
      <v-col>
        <v-row class="ma-5">
          <v-col
            cols="1"
          >
            <v-btn
              :disabled="!canSaveDriver"
              class="mr-3"
              @click.prevent="saveDriver"
            >
              Save Driver
            </v-btn>
          </v-col>
          <v-col
            cols="1"
          >
            <v-btn
              class="mr-3"
              @click.prevent="clearDriver"
            >
              Clear
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="ma-5">
          <v-col>
            <v-form :value="canSaveDriver">
              <v-row dense>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="manufacturer"
                    :rules="rules"
                    label="Manufacturer"
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field v-model="model" :rules="rules" label="Model" />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="nomenclature"
                    :rules="rules"
                    label="Nomenclature"
                    hint="Instrument class or description"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="identityQueryCommand"
                    label="Identity Query Command"
                    hint="Command sent to instrument to ask it for it's identity"
                  />
                </v-col>
                <v-col>
                  <v-select
                    v-model="terminator"
                    :rules="rules"
                    :items="[
                      { text: 'None', value: 'none' },
                      { text: 'Carriage return', value: 'Cr' },
                      { text: 'Line feed', value: 'Lf' },
                      { text: 'Carriage return / Line feed', value: 'CrLf' },
                    ]"
                    label="Terminator"
                    hint="Character(s) used to signal the end of a read/write"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
        <DirectControlComponent />
        <v-row class="ml-2">
          <v-col>
            <v-btn color="primary" @click="addNewInstructionSet">
              Add Instruction Set
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="ml-2">
          <v-col>
            Instruction Sets
            <v-expansion-panels
              v-model="expandedInstructionSet"
              style="width: 98%"
              class="ml-5 mt-7 mb-n10"
              dense
            >
              <v-expansion-panel
                v-for="instructionSet in driver.instructionSets"
                :key="instructionSet.id"
                class="grey"
                dense
              >
                <v-expansion-panel-header class="white" style="height: 25px">
                  {{ instructionSet.name }}
                  <v-spacer></v-spacer>
                  <v-btn
                    :disabled="!isCommunicationInterfaceConnected || instructionSet.instructions.length <= 0"
                    color="primary"
                    class="mr-3"
                    max-width="100"
                    @click.native.stop="onTestInstructionSetButtonClicked(instructionSet)"
                  >
                    Test
                  </v-btn>
                  <v-btn
                    color="primary"
                    class="mr-3"
                    max-width="100"
                    @click.native.stop="renameInstructionSet(instructionSet)"
                    >Rename</v-btn
                  >
                  <v-btn
                    color="primary"
                    class="mr-3"
                    max-width="100"
                    @click.native.stop="saveInstructionSetToLibrary(instructionSet)"
                    >Save</v-btn
                  >
                  <v-btn
                    color="primary"
                    max-width="100"
                    @click.native.stop="removeInstructionSet(instructionSet)"
                    >Remove</v-btn
                  >
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <InstructionTableComponent
                    :instructions="instructionSet.instructions"
                    @edit-instruction-command="onInstructionTableComponentEditInstructionCommand"
                    @instruction-added="onInstructionTableComponentInstructionAdded(instructionSet, $event)"
                    @instruction-updated="onInstructionTableComponentInstructionUpdated(instructionSet, $event)"
                    @instruction-removed="onInstructionTableComponentInstructionRemoved(instructionSet, $event)"
                    @reordered="onInstructionTableComponentReordered(instructionSet, $event)"
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import InstructionTableComponent from "@/components/driver-builder/InstructionTable.vue";
import { Item, ItemInstruction } from '@/components/driver-builder/InstructionsAndTemplatesItemInterfaces';
import { IEEE4882MandatedCommands, SCPIRequiredCommands, Driver, CommandParameter, CustomInstruction, InstructionSet } from 'visualcal-common/src/driver-builder';
import { requiredRule, VuetifyRule } from "@/utils/vuetify-input-rules";
import CommandParametersBuilderDialogComponent from "@/components/driver-builder/CommandParametersBuilderDialog.vue";
import RenameInstructionSetDialogComponent from "@/components/driver-builder/RenameInstructionSetDialog.vue";
import DirectControlComponent from "@/components/driver-builder/DirectControlComponent.vue";
import DirectControlTesterDialog from "@/components/driver-builder/DirectControlTesterDialog.vue";
import { v4 as uuid } from 'uuid';
import InstructionsAndTemplatesPanelComponent from '@/components/driver-builder/InstructionsAndTemplatesPanel.vue';

// const MockDriver: Driver = {
//   manufacturer: "Fluke",
//   model: "45",
//   nomenclature: "Digital Multimeter",
//   identityQueryCommand: "*IDN?",
//   terminator: "Lf",
//   instructionSets: [],
// };

@Component({
  components: {
    InstructionTableComponent,
    CommandParametersBuilderDialogComponent,
    RenameInstructionSetDialogComponent,
    DirectControlComponent,
    DirectControlTesterDialog,
    InstructionsAndTemplatesPanelComponent
  }
})
export default class DriverBuilderView extends Vue {

  shouldCommandBuilderDialogShow = false;
  commandBuilderDialogInstruction: CustomInstruction = {
    id: 'new',
    order: 0,
    name: '',
    type: 'Write',
    command: 'Command?',
  };

  shouldRenameInstructionSetDialogShow = false;
  selectedRenameInstructionSet: InstructionSet = { id: uuid(), name: "", instructions: [] };

  expandedInstructionSet = 0;

  shouldDirectControlTesterDialogShow = false;
  selectedInstructionSetUnderTest: InstructionSet = { id: uuid(), name: "", instructions: [] };

  rules: VuetifyRule[] = [requiredRule];

  items: Item[] = [
    {
      id: uuid(),
      name: 'Built-in',
      children: [
        {
          id: uuid(),
          name: "Instructions",
          children: [
            { id: uuid(), name: "Digital Multimeter" },
            { id: uuid(), name: "Signal Generator" },
            { id: uuid(), name: "Waveform Generator" }
          ]
        },
        {
          id: uuid(),
          name: "Instruction Sets",
          children: []
        }
      ]
    },
    {
      id: uuid(),
      name: "Categories",
      children: [
        {
          id: uuid(),
          name: "Digital Multimeter",
          children: [
            {
              id: uuid(),
              name: 'Measure AC Volts',
              file: 'json'
            },
            {
              id: uuid(),
              name: 'Measure DC Volts',
              file: 'json'
            }
          ]
        }
      ]
    },
    {
      id: uuid(),
      name: "Drivers",
      children: []
    }
  ];

  get canSaveDriver() {
    return this.manufacturer !== '' && this.model !== '' && this.nomenclature !== '' && this.terminator !== '';
  }

  get driver() {
    return this.$store.direct.state.driverBuilder.currentDriver;
  }
  set driver(value: Driver) {
    this.$store.direct.commit.driverBuilder.setCurrentDriver(value);
  }

  get manufacturer() {
    return this.driver.manufacturer;
  }
  set manufacturer(value: string) {
    this.$store.direct.commit.driverBuilder.setManufacturer(value);
  }

  get model() {
    return this.driver.model;
  }
  set model(value: string) {
    this.$store.direct.commit.driverBuilder.setModel(value);
  }

  get nomenclature() {
    return this.driver.nomenclature;
  }
  set nomenclature(value: string) {
    this.$store.direct.commit.driverBuilder.setNomenclature(value);
  }

  get identityQueryCommand() {
    return this.driver.identityQueryCommand;
  }
  set identityQueryCommand(value: string | undefined) {
    this.$store.direct.commit.driverBuilder.setIdentityQueryCommand(value);
  }

  get terminator() {
    return this.driver.terminator;
  }
  set terminator(value: string) {
    this.$store.direct.commit.driverBuilder.setTerminator(value);
  }

  get isCommunicationInterfaceConnected() { return this.$store.direct.state.driverBuilder.isSelectedCommunicationInterfaceConnected; }

  get drivers() { return this.$store.direct.state.driverBuilder.drivers; }
  get instructionSets() { return this.$store.direct.state.driverBuilder.instructionSets; }

  async mounted() {
    const builtInCategory = this.items.find((i) => i.name === 'Built-in');
    if (!builtInCategory || !builtInCategory.children) return;
    const instructionsCategory = (builtInCategory.children as Item[]).find((i) => i.name === 'Instructions');
    if (!instructionsCategory) return;
    if (!instructionsCategory.children) instructionsCategory.children = [];
    const SCPIMandatedCategory: Item = {
      id: uuid(),
      name: 'IEEE 488.2 / SCPI Mandated',
      children: [],
    };
    IEEE4882MandatedCommands.forEach((c) => {
      const instruction: ItemInstruction = {
        ...c,
        id: uuid(),
        file: 'json',
      };
      if (SCPIMandatedCategory.children)
        SCPIMandatedCategory.children.push(instruction);
    });
    (instructionsCategory.children as Item[]).unshift(SCPIMandatedCategory);
    const SCPIRequiredCategory: Item = { id: uuid(), name: 'SCPI Required', children: [] };
    SCPIRequiredCommands.forEach((c) => {
      const instruction: ItemInstruction = {
        ...c,
        id: uuid(),
        file: 'json',
      };
      if (SCPIRequiredCategory.children)
        SCPIRequiredCategory.children.push(instruction);
    });
    (instructionsCategory.children as Item[]).unshift(SCPIRequiredCategory);
    await this.$store.direct.dispatch.driverBuilder.init();
    try {
      await this.$store.direct.dispatch.driverBuilder.refreshOnlineStore();
    } catch (error) {
      console.error(error);
    }
  }

  onCommandParametersBuilderDialogSave(instruction: CustomInstruction, parameters: CommandParameter[]) {
    this.shouldCommandBuilderDialogShow = false;
    const instructionSet = this.$store.direct.state.driverBuilder.currentDriver.instructionSets[this.expandedInstructionSet];
    if (!instructionSet) return;
    this.$store.direct.commit.driverBuilder.setDriverInstructionSetInstructionCommandParameters({
      instructionSetId: instructionSet.id,
      instruction: instruction,
      parameters: parameters
    });
  }

  onInstructionTableComponentEditInstructionCommand(instruction: CustomInstruction) {
    this.commandBuilderDialogInstruction = instruction;
    this.shouldCommandBuilderDialogShow = true;
  }

  addNewInstructionSet() {
    this.$store.direct.commit.driverBuilder.addDriverInstructionSet();
  }

  renameInstructionSet(instructionSet: InstructionSet) {
    this.selectedRenameInstructionSet = instructionSet;
    this.shouldRenameInstructionSetDialogShow = true;
  }

  onInstructionSetRenamed(opts: {
    originalInstructionSet: InstructionSet;
    newName: string;
  }) {
    this.shouldRenameInstructionSetDialogShow = false;
    this.$store.direct.commit.driverBuilder.renameInstructionSet({
      id: opts.originalInstructionSet.id,
      oldName: opts.originalInstructionSet.name,
      newName: opts.newName,
    });
  }

  removeInstructionSet(instructionSet: InstructionSet) {
    this.$store.direct.commit.driverBuilder.removeDriverInstructionSet(instructionSet.id);
  }

  onInstructionTableComponentInstructionAdded(instructionSet: InstructionSet, newInstruction: CustomInstruction) {
    this.$store.direct.commit.driverBuilder.addNewDriverInstructionToSet({
      instructionSetId: instructionSet.id,
      newInstruction: newInstruction,
    });
  }

  onInstructionTableComponentInstructionUpdated(instructionSet: InstructionSet, instruction: CustomInstruction) {
    this.$store.direct.commit.driverBuilder.updateDriverInstructionFromInstructionSet({ instructionSetId: instructionSet.id, instruction: instruction });
  }

  onInstructionTableComponentInstructionRemoved(instructionSet: InstructionSet, instruction: CustomInstruction) {
    this.$store.direct.commit.driverBuilder.removeDriverInstructionFromInstructionSet({ instructionSetId: instructionSet.id, instructionId: instruction.id });
  }

  async onInstructionTableComponentReordered(instructionSet: InstructionSet, instructions: CustomInstruction[]) {
    this.$store.direct.commit.driverBuilder.setInstructionSetInstructionsOrder({ instructionSetId: instructionSet.id, instructions: instructions });
  }

  onTestInstructionSetButtonClicked(instructionSet: InstructionSet) {
    this.selectedInstructionSetUnderTest = instructionSet;
    this.shouldDirectControlTesterDialogShow = true;
  }

  async saveInstructionSetToLibrary(instructionSet: InstructionSet) {
    this.$store.direct.commit.driverBuilder.saveInstructionSetToLibrary(instructionSet);
    await this.$store.direct.dispatch.driverBuilder.saveLibrary();
  }

  async saveDriver() {
    await this.$store.direct.dispatch.driverBuilder.saveCurrentDriver();
  }

  clearDriver() {
    this.driver = {
      manufacturer: '',
      model: '',
      nomenclature: '',
      terminator: 'Lf',
      instructionSets: [],
      identityQueryCommand: ''
    }
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
