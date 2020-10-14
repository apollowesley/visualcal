<template>
  <v-container fluid class="grey" style="height: 100vh">
    <CommandParametersBuilderDialogComponent
      :should-show="shouldCommandBuilderDialogShow"
      :instruction="commandBuilderDialogInstruction"
      @save="onCommandBuilderSave"
      @cancel="shouldCommandBuilderDialogShow = false"
    />
    <RenameInstructionSetDialogComponent
      :should-show="shouldRenameInstructionSetDialogShow"
      :instruction-set="selectedRenameInstructionSet"
      @renamed="onInstructionSetRenamed"
      @cancel="shouldRenameInstructionSetDialogShow = false"
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
    <v-row class="flex-nowrap" style="height: 96vh" no-gutters>
      <v-col cols="2">
        <v-row no-gutters style="height: 2%">
          <v-col>
            <h4>Instructions and Templates</h4>
          </v-col>
        </v-row>
        <v-row no-gutters style="height: 98%">
          <v-col>
            <v-treeview
              v-model="tree"
              :open="open"
              :items="items"
              style="
                height: 100%;
                width: 100%;
                background: white;
                font-size: 14px;
              "
              activatable
              item-key="id"
              open-on-click
              dense
            >
              <template v-slot:prepend="{ item, open }">
                <v-icon v-if="!item.file">
                  {{ open ? "mdi-folder-open" : "mdi-folder" }}
                </v-icon>
                <v-icon v-else>
                  {{ files[item.file] }}
                </v-icon>
              </template>
              <template v-slot:label="{ item }">
                <label
                  v-if="item.command"
                  draggable
                  @dragstart="onDragStart($event, item)"
                  class="drag-item"
                >
                  {{ item.name }}
                </label>
                <label v-else>
                  {{ item.name }}
                </label>
              </template>
            </v-treeview>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-row class="ma-5">
          <v-col>
            <v-form v-model="canSaveForm">
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
                  <v-checkbox v-model="identifiable" label="Identifiable?" />
                </v-col>
                <v-col v-if="identifiable">
                  <v-text-field
                    v-model="identityQueryCommand"
                    :rules="identifiable ? rules : []"
                    label="Identity Query Command"
                    hint="Command sent to instrument to ask it for it's identity"
                  />
                </v-col>
                <v-col>
                  <v-checkbox v-model="isGpib" label="Has a GPIB interface?" />
                </v-col>
                <v-col>
                  <v-select
                    v-model="terminator"
                    :rules="rules"
                    :items="[
                      'None',
                      'Carriage return',
                      'Line feed',
                      'Carriage return / Line feed',
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
              style="width: 98%"
              class="ml-5 mt-7 mb-n10"
              dense
            >
              <v-expansion-panel
                v-for="instructionSet in driver.instructionSets"
                :key="instructionSet.name"
                class="grey"
                dense
              >
                <v-expansion-panel-header class="white">
                  {{ instructionSet.name }}
                  <v-spacer></v-spacer>
                  <v-btn
                    :disabled="!isCommunicationInterfaceConnected || instructionSet.instructions.length <= 0 || isTesting"
                    color="primary"
                    class="mr-3"
                    max-width="100"
                    @click.native.stop="onTestInstructionSet(instructionSet)"
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
import {
  Instruction,
  IEEE4882MandatedCommands,
  SCPIRequiredCommands,
  Driver,
  CommandParameter,
  CustomInstruction,
  InstructionSet,
} from "@/driver-builder";
import { requiredRule, VuetifyRule } from "@/utils/vuetify-input-rules";
import CommandParametersBuilderDialogComponent from "@/components/driver-builder/CommandParametersBuilderDialog.vue";
import RenameInstructionSetDialogComponent from "@/components/driver-builder/RenameInstructionSetDialog.vue";
import DirectControlComponent from "@/components/driver-builder/DirectControlComponent.vue";
import { v4 as uuid } from 'uuid';

interface ItemInstruction extends Instruction {
  id: string;
  file?: string;
}

interface Item {
  id: string;
  name: string;
  children?: Item[] | ItemInstruction[];
  file?: string;
}

const MockDriver: Driver = {
  manufacturer: "Fluke",
  model: "45",
  nomenclature: "Digital Multimeter",
  identifiable: true,
  identityQueryCommand: "*IDN?",
  isGpib: true,
  terminator: "Line feed",
  instructionSets: [],
};

@Component({
  components: {
    InstructionTableComponent,
    CommandParametersBuilderDialogComponent,
    RenameInstructionSetDialogComponent,
    DirectControlComponent
  }
})
export default class DriverBuilderView extends Vue {
  shouldCommandBuilderDialogShow = false;
  commandBuilderDialogInstruction: CustomInstruction = {
    id: "new",
    order: 0,
    name: "",
    type: "Write",
    command: "Command?",
  };

  shouldRenameInstructionSetDialogShow = false;
  selectedRenameInstructionSet: InstructionSet = { name: "", instructions: [] };
  isTesting = false;

  rules: VuetifyRule[] = [requiredRule];
  canSaveForm = false;
  localDriver: Driver = this.driver;
  tree = [{ name: "test" }];
  open = [];
  files: Record<string, string> = {
    html: "mdi-language-html5",
    js: "mdi-nodejs",
    json: "mdi-code-json",
    md: "mdi-language-markdown",
    pdf: "mdi-file-pdf",
    png: "mdi-file-image",
    txt: "mdi-file-document-outline",
    xls: "mdi-file-excel",
    fold: "mdi-folder",
  };
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
      name: "Devices",
      children: [
        {
          id: uuid(),
          name: "Fluke",
          children: [
            {
              id: uuid(),
              name: "45",
              children: [
                {
                  id: uuid(),
                  name: "Instructions",
                  children: [
                    {
                      id: uuid(),
                      name: "Set mode AC volts",
                      file: "json",
                      command: "CONF:VOLTS:AC",
                      type: "Write",
                    }
                  ]
                },
                {
                  id: uuid(),
                  name: "Instruction Sets",
                  children: [
                    {
                      id: uuid(),
                      name: "Measure AC Volts",
                      file: "json",
                    }
                  ]
                },
                {
                  id: uuid(),
                  name: 'Categories',
                  children: [
                    {
                      id: uuid(),
                      name: 'Digital Multimeter',
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
                }
              ]
            }
          ]
        }
      ]
    }
  ];

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

  get identifiable() {
    return this.driver.identifiable;
  }
  set identifiable(value: boolean) {
    this.$store.direct.commit.driverBuilder.setIdentifiable(value);
  }

  get identityQueryCommand() {
    return this.driver.identityQueryCommand;
  }
  set identityQueryCommand(value: string) {
    this.$store.direct.commit.driverBuilder.setIdentityQueryCommand(value);
  }

  get isGpib() {
    return this.driver.isGpib;
  }
  set isGpib(value: boolean) {
    this.$store.direct.commit.driverBuilder.setIsGpib(value);
  }

  get terminator() {
    return this.driver.terminator;
  }
  set terminator(value: string) {
    this.$store.direct.commit.driverBuilder.setTerminator(value);
  }

  get isCommunicationInterfaceConnected() { return this.$store.direct.state.driverBuilder.isSelectedCommunicationInterfaceConnected; }

  async mounted() {
    this.localDriver = MockDriver;
    this.driver = this.localDriver;
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
        id: uuid(),
        ...c,
        file: 'json',
      };
      if (SCPIMandatedCategory.children)
        SCPIMandatedCategory.children.push(instruction);
    });
    (instructionsCategory.children as Item[]).unshift(SCPIMandatedCategory);
    const SCPIRequiredCategory: Item = { id: uuid(), name: 'SCPI Required', children: [] };
    SCPIRequiredCommands.forEach((c) => {
      const instruction: ItemInstruction = {
        id: uuid(),
        ...c,
        file: 'json',
      };
      if (SCPIRequiredCategory.children)
        SCPIRequiredCategory.children.push(instruction);
    });
    (instructionsCategory.children as Item[]).unshift(SCPIRequiredCategory);
    await this.$store.direct.dispatch.driverBuilder.init();
  }

  onDragStart(event: DragEvent, instruction: Instruction) {
    if (!event || !event.dataTransfer) return;
    const instructionString = JSON.stringify(instruction);
    event.dataTransfer.dropEffect = 'copy';
    event.dataTransfer.setData('application/json', instructionString);
  }

  onCommandBuilderSave(
    instruction: CustomInstruction,
    parameters: CommandParameter[]
  ) {
    instruction.parameters = parameters;
  }

  onInstructionTableComponentEditInstructionCommand(
    instruction: CustomInstruction
  ) {
    this.commandBuilderDialogInstruction = instruction;
    this.shouldCommandBuilderDialogShow = true;
  }

  addNewInstructionSet() {
    this.$store.direct.commit.driverBuilder.addNewDriverInstructionSet();
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
      oldName: opts.originalInstructionSet.name,
      newName: opts.newName,
    });
  }

  removeInstructionSet(instructionSet: InstructionSet) {
    this.$store.direct.commit.driverBuilder.removeDriverInstructionSet(
      instructionSet.name
    );
  }

  onInstructionTableComponentInstructionAdded(instructionSet: InstructionSet, newInstruction: CustomInstruction) {
    this.$store.direct.commit.driverBuilder.addNewDriverInstructionToSet({
      instructionSetName: instructionSet.name,
      newInstruction: newInstruction,
    });
  }

  onInstructionTableComponentInstructionUpdated(instructionSet: InstructionSet, instruction: CustomInstruction) {
    this.$store.direct.commit.driverBuilder.updateDriverInstructionFromInstructionSet({ instructionSetName: instructionSet.name, instruction: instruction });
  }

  onInstructionTableComponentInstructionRemoved(instructionSet: InstructionSet, instruction: CustomInstruction) {
    this.$store.direct.commit.driverBuilder.removeDriverInstructionFromInstructionSet({ instructionSetName: instructionSet.name, instructionId: instruction.id });
  }

  async onInstructionTableComponentReordered(instructionSet: InstructionSet, instructions: CustomInstruction[]) {
    this.$store.direct.commit.driverBuilder.setInstructionSetInstructionsOrder({ instructionSetName: instructionSet.name, instructions: instructions });
  }

  async onTestInstructionSet(instructionSet: InstructionSet) {
    this.isTesting = true;
    try {
      const responses: string[] = [];
      for (const instruction of instructionSet.instructions) {
        const response = await this.onTestInstruction(instruction, false);
        if (response) responses.push(response);
      }
      console.info(responses);
    } catch (error) {
      alert(error.message);
    }
    this.isTesting = false;
  }

  async onTestInstruction(instruction: CustomInstruction, toggleIsTesting = true) {
    if (toggleIsTesting) this.isTesting = true;
    const command = new TextEncoder().encode(instruction.command);
    let response: ArrayBufferLike | undefined = undefined;
    let responseString = '';
    switch (instruction.type) {
      case 'Write':
        await this.$store.direct.dispatch.driverBuilder.write(command);
        break;
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
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
