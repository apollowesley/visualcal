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
      <v-col
        class="text-center"
      >
        <v-row no-gutters>
          <v-col>
            <h2>Driver Builder</h2>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row
      class="flex-nowrap"
      style="height: 96vh"
      no-gutters
    >
      <v-col
        cols="2"
      >
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
              style="height: 100%; width: 100%; background: white; font-size: 14px"
              activatable
              item-key="name"
              open-on-click
              dense
            >
              <template v-slot:prepend="{ item, open }">
                <v-icon v-if="!item.file">
                  {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                </v-icon>
                <v-icon v-else>
                  {{ files[item.file] }}
                </v-icon>
              </template>
              <template
                v-slot:label="{ item }"
              >
                <label
                  v-if="item.command"
                  draggable
                  @dragstart="onDragStart($event, item)"
                  class="drag-item"
                >
                  {{ item.name }}
                </label>
                <label
                  v-else
                >
                  {{ item.name }}
                </label>
              </template>
            </v-treeview>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-row
          class="ma-5"
        >
          <v-col>
            <v-form
              v-model="canSaveForm"
            >
              <v-row dense>
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
          </v-col>
        </v-row>
        <v-row
          class="ml-2"
        >
          <v-col>
            <v-btn
              color="primary"
              @click="addNewInstructionSet"
            >
              Add Instruction Set
            </v-btn>
          </v-col>
        </v-row>
        <v-row
          class="ml-2"
        >
          <v-col>
            Instruction Sets
            <v-expansion-panels
              style="width: 98%"
              class="ml-5 mt-7 mb-n10"
              dense
            >
              <v-expansion-panel
                v-for="(instructionSet) in driver.instructionSets"
                :key="instructionSet.name"
                class="grey"
                dense
              >
                <v-expansion-panel-header class="white">
                  {{ instructionSet.name }}
                  <v-spacer></v-spacer>
                  <v-btn color="primary" class="mr-3" max-width="100" @click.native.stop="renameInstructionSet(instructionSet)">Rename</v-btn>
                  <v-btn color="primary" max-width="100" @click.native.stop="removeInstructionSet(instructionSet)">Remove</v-btn>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <InstructionTableComponent
                    :instructions="instructionSet.instructions"
                    @edit-instruction-command="onInstructionTableComponentEditInstructionCommand"
                    @instruction-added="onInstructionTableComponentInstructionAdded(instructionSet, $event)"
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
import { Vue, Component } from 'vue-property-decorator';
import InstructionTableComponent from '@/components/driver-builder/InstructionTable.vue';
import { Instruction, IEEE4882MandatedCommands, SCPIRequiredCommands, Driver, CommandParameter, CustomInstruction, InstructionSet } from '@/driver-builder';
import { requiredRule, VuetifyRule } from '@/utils/vuetify-input-rules';
import CommandParametersBuilderDialogComponent from '@/components/driver-builder/CommandParametersBuilderDialog.vue';
import RenameInstructionSetDialogComponent from '@/components/driver-builder/RenameInstructionSetDialog.vue';

interface ItemInstruction extends Instruction {
  file?: string;
}

interface Item {
  name: string;
  children?: Item[] | ItemInstruction[];
  file?: string;
}

const MockDriver: Driver = {
  manufacturer: 'Fluke',
  model: '45',
  nomenclature: 'Digital Multimeter',
  identifiable: true,
  identityQueryCommand: '*IDN?',
  isGpib: true,
  terminator: 'Line feed',
  instructionSets: []
};

@Component({
  components: {
    InstructionTableComponent,
    CommandParametersBuilderDialogComponent,
    RenameInstructionSetDialogComponent
  }
})
export default class DriverBuilderView extends Vue {

  shouldCommandBuilderDialogShow = false;
  commandBuilderDialogInstruction: CustomInstruction = { id: 'new', order: 0, name: '', type: 'Write', command: 'Command?' };

  shouldRenameInstructionSetDialogShow = false;
  selectedRenameInstructionSet: InstructionSet = { name: '', instructions: [] };

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
    terminator: 'None',
    instructionSets: []
  } : MockDriver;

  tree = [{ name: 'test' }];
  open = [];
  files: Record<string, string> = {
    html: 'mdi-language-html5',
    js: 'mdi-nodejs',
    json: 'mdi-code-json',
    md: 'mdi-language-markdown',
    pdf: 'mdi-file-pdf',
    png: 'mdi-file-image',
    txt: 'mdi-file-document-outline',
    xls: 'mdi-file-excel',
    fold: 'mdi-folder'
  }
  items: Item[] = [
    { name: 'Instructions',
      file: 'fold',
      children: [
        { name: 'Digital Multimeter', file: 'fold' },
        { name: 'Signal Generator', file: 'fold' },
        { name: 'Waveform Generator', file: 'fold' }
      ]
    },
    {
      name: 'Instruction Sets',
      file: 'fold',
      children: []
    },
    {
      name: 'Templates',
      file: 'fold',
      children: []
    },
    {
      name: 'Drivers',
      file: 'fold',
      children: []
    }
  ]
 
  mounted() {
    const instructionsCategory = this.items.find(i => i.name === 'Instructions');
    if (!instructionsCategory) return;
    if (!instructionsCategory.children) instructionsCategory.children = [];
    const SCPIMandatedCategory: Item = { name: 'IEEE 488.2 / SCPI Mandated', children: [] };
    IEEE4882MandatedCommands.forEach(c => {
      const instruction: ItemInstruction = {
        ...c,
        file: 'json'
      }
      if (SCPIMandatedCategory.children) SCPIMandatedCategory.children.push(instruction);
    });
    (instructionsCategory.children as Item[]).unshift(SCPIMandatedCategory);
    const SCPIRequiredCategory: Item = { name: 'SCPI Required', children: [] };
    SCPIRequiredCommands.forEach(c => {
      const instruction: ItemInstruction = {
        ...c,
        file: 'json'
      }
      if (SCPIRequiredCategory.children) SCPIRequiredCategory.children.push(instruction);
    });
    (instructionsCategory.children as Item[]).unshift(SCPIRequiredCategory);
  }

  onDragStart(event: DragEvent, instruction: Instruction) {
    if (!event || !event.dataTransfer) return;
    const instructionString = JSON.stringify(instruction);
    event.dataTransfer.dropEffect = 'copy';
    event.dataTransfer.setData('application/json', instructionString);
  }

  onCommandBuilderSave(instruction: CustomInstruction, parameters: CommandParameter[]) {
    instruction.parameters = parameters;
  }

  onInstructionTableComponentEditInstructionCommand(instruction: CustomInstruction) {
    this.commandBuilderDialogInstruction = instruction;
    this.shouldCommandBuilderDialogShow = true;
  }

  addNewInstructionSet() {
    this.driver.instructionSets.push({
      name: 'New Instruction Set',
      instructions: []
    });
  }

  renameInstructionSet(instructionSet: InstructionSet) {
    this.selectedRenameInstructionSet = instructionSet;
    this.shouldRenameInstructionSetDialogShow = true;
  }

  onInstructionSetRenamed(opts: { originalInstructionSet: InstructionSet, newName: string }) {
    this.shouldRenameInstructionSetDialogShow = false;
    const foundSet = this.driver.instructionSets.find(i => i.name === opts.originalInstructionSet.name);
    if (!foundSet) return;
    foundSet.name = opts.newName;
  }

  removeInstructionSet(instructionSet: InstructionSet) {
    const setIndex = this.driver.instructionSets.findIndex(i => i.name === instructionSet.name);
    if (setIndex < 0) return;
    this.driver.instructionSets.splice(setIndex, 1);
  }

  // eslint-disable-next-line
  async onInstructionTableComponentInstructionAdded(instructionSet: InstructionSet, newInstruction: CustomInstruction) {
    //
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
