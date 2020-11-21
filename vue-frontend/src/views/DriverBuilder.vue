<template>
  <v-container id="main-container" fluid class="grey" style="height: 100vh; overflow-x: auto; overflow-y: hidden;">
    <AppBarComponent
      v-model="showInstructionsAndTemplatesPanel"
    />
    <InstructionsAndTemplatesComponent
      v-model="showInstructionsAndTemplatesPanel"
      :items="items"
    />
    <v-row class="ma-5 driver-details-row" no-gutters>
      <v-col>
        <v-row>
          <v-col>
            <v-btn
              :disabled="!canSaveDriver"
              class="mr-3"
              color="green"
              @click.prevent="saveDriver"
            >
              Save Driver
            </v-btn>
            <v-btn
              class="mr-3"
              color="error"
              @click.prevent="clearDriver"
            >
              Clear
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card
              class="pa-2 pl-5 pr-5"
            >
              <v-card-title>
                <h4>Details</h4>
              </v-card-title>
              <v-form :value="canSaveDriver">
                <v-row dense>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model="manufacturer"
                      :rules="rules"
                      label="Manufacturer"
                      dense
                    />
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model="model"
                      :rules="rules"
                      label="Model"
                      dense
                    />
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model="nomenclature"
                      :rules="rules"
                      label="Nomenclature"
                      persistent-hint
                      hint="Instrument class or description"
                      dense
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="identityQueryCommand"
                      label="Identity Query Command"
                      persistent-hint
                      hint="Command sent to instrument to ask it for it's identity"
                      dense
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
                        { text: 'Carriage return / Line feed', value: 'CrLf' }
                      ]"
                      label="Terminator"
                      persistent-hint
                      hint="Character(s) used to signal the end of a read/write"
                      dense
                    />
                  </v-col>
                  <v-col>
                    <fieldset>
                      <legend>Categories</legend>
                      <div
                        v-for="category in availableCategories"
                        :key="category._id"
                      >
                        <input
                          :id="`driver-category-${category._id}`"
                          class="driver-category-checkbox"
                          type="checkbox"
                          dense
                          style="margin-right: 4px"
                          @change="onDriverAvailableCategoryCheckChanged(category, $event)"
                        >
                        <label :for="`driver-category-${category._id}`">{{ category.name }}</label>
                      </div>
                    </fieldset>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card class="pa-3 instruction-sets-row">
              <v-card-title>
                <h3>Instruction Sets</h3>
              </v-card-title>
              <v-card-actions>
                <v-btn color="primary" @click="addNewInstructionSet">
                  Add
                </v-btn>
                <v-btn
                  color="secondary"
                  @click="shouldVariableEditorDialogShow = true"
                >
                  Edit Variables
                </v-btn>
              </v-card-actions>
              <div id="driver-builder-editor-instruction-sets">
                <v-expansion-panels
                  v-model="expandedInstructionSet"
                  dense
                >
                  <v-expansion-panel
                    v-for="instructionSet in instructionSets"
                    :key="instructionSet._id"
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
                        @edit-instruction-pre-parameters="onInstructionTableComponentEditPreParameters"
                        @edit-instruction-post-parameters="onInstructionTableComponentEditPostParameters"
                        @reordered="onInstructionTableComponentReordered(instructionSet, $event)"
                        @instruction-added="onInstructionTableComponentInstructionAdded(instructionSet, $event)"
                        @instruction-updated="onInstructionTableComponentInstructionUpdated(instructionSet, $event)"
                        @instruction-removed="onInstructionTableComponentInstructionRemoved(instructionSet, $event)"
                      />
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <DriverVariablesListBuilderDialogComponent
      v-model="shouldVariableEditorDialogShow"
    />
    <CommandParametersBuilderDialogComponent
      :should-show="shouldCommandBuilderDialogShow"
      :parameters="commandBuilderDialogInstructionCommandParameters"
      :parameters-type="commandBuilderDialogInstructionCommandParametersType"
      :instruction="commandBuilderDialogInstruction"
      :instructions-with-read-response="commandBuilderDialogInstructionsWithReadResponse"
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
      @cancel="shouldDirectControlTesterDialogShow = false"
    />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import InstructionTableComponent from "@/components/driver-builder/InstructionTable.vue";
import { Item, ItemInstruction } from '@/components/driver-builder/InstructionsAndTemplatesItemInterfaces';
import { IEEE4882MandatedCommands, SCPIRequiredCommands, Driver, CommandParameter, Instruction, InstructionSet, CommandParameterType, DriverCategory } from 'visualcal-common/src/driver-builder';
import { requiredRule, VuetifyRule } from "@/utils/vuetify-input-rules";
import CommandParametersBuilderDialogComponent from "@/components/driver-builder/CommandParametersBuilderDialog.vue";
import RenameInstructionSetDialogComponent from "@/components/driver-builder/RenameInstructionSetDialog.vue";
import DirectControlTesterDialog from "@/components/driver-builder/DirectControlTesterDialog.vue";
import { generateUuid } from '@/utils/uuid';
import InstructionsAndTemplatesPanelComponent from '@/components/driver-builder/InstructionsAndTemplatesPanel.vue';
import DriverVariablesListBuilderDialogComponent from '@/components/driver-builder/DriverVariablesListBuilderDialog.vue';
import AppBarComponent from '@/components/driver-builder/AppBar.vue';
import InstructionsAndTemplatesComponent from '@/components/driver-builder/InstructionsAndTemplates.vue';

@Component({
  components: {
    InstructionTableComponent,
    CommandParametersBuilderDialogComponent,
    RenameInstructionSetDialogComponent,
    DirectControlTesterDialog,
    InstructionsAndTemplatesPanelComponent,
    DriverVariablesListBuilderDialogComponent,
    AppBarComponent,
    InstructionsAndTemplatesComponent
  }
})
export default class DriverBuilderView extends Vue {

  showInstructionsAndTemplatesPanel = false;

  shouldVariableEditorDialogShow = false;

  shouldCommandBuilderDialogShow = false;
  commandBuilderDialogInstruction: Instruction = {
    _id: 'new',
    name: '',
    type: 'Write',
    command: 'Command?',
  };

  commandBuilderDialogInstructionCommandParameters: CommandParameter[] = [];
  commandBuilderDialogInstructionCommandParametersType: CommandParameterType = 'pre';
  commandBuilderDialogInstructionsWithReadResponse: Instruction[] = [];

  shouldRenameInstructionSetDialogShow = false;
  selectedRenameInstructionSet: InstructionSet = { _id: generateUuid(), name: "", instructions: [] };

  expandedInstructionSet = -1;

  shouldDirectControlTesterDialogShow = false;
  selectedInstructionSetUnderTest: InstructionSet = { _id: generateUuid(), name: "", instructions: [] };

  rules: VuetifyRule[] = [requiredRule];

  selectedCategories: string[] = [];

  items: Item[] = [
    {
      _id: generateUuid(),
      name: 'Built-in',
      children: [
        {
          _id: generateUuid(),
          name: "Instructions",
          children: [
            { _id: generateUuid(), name: "Digital Multimeter" },
            { _id: generateUuid(), name: "Signal Generator" },
            { _id: generateUuid(), name: "Waveform Generator" }
          ]
        },
        {
          _id: generateUuid(),
          name: "Instruction Sets",
          children: []
        }
      ]
    },
    {
      _id: generateUuid(),
      name: "Categories",
      children: [
        {
          _id: generateUuid(),
          name: "Digital Multimeter",
          children: [
            {
              _id: generateUuid(),
              name: 'Measure AC Volts',
              file: 'json'
            },
            {
              _id: generateUuid(),
              name: 'Measure DC Volts',
              file: 'json'
            }
          ]
        }
      ]
    },
    {
      _id: generateUuid(),
      name: "Drivers",
      children: []
    }
  ];

  get availableCategories() {
    return this.$store.direct.state.driverBuilder.categories;
  }

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
    return this.driver.driverManufacturer;
  }
  set manufacturer(value: string) {
    this.$store.direct.commit.driverBuilder.setManufacturer(value);
  }

  get model() {
    return this.driver.driverModel;
  }
  set model(value: string) {
    this.$store.direct.commit.driverBuilder.setModel(value);
  }

  get nomenclature() {
    return this.driver.driverNomenclature;
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
  get instructionSets() { return this.$store.direct.state.driverBuilder.currentDriver.instructionSets; }

  async mounted() {
    const builtInCategory = this.items.find((i) => i.name === 'Built-in');
    if (!builtInCategory || !builtInCategory.children) return;
    const instructionsCategory = (builtInCategory.children as Item[]).find((i) => i.name === 'Instructions');
    if (!instructionsCategory) return;
    if (!instructionsCategory.children) instructionsCategory.children = [];
    const SCPIMandatedCategory: Item = {
      _id: generateUuid(),
      name: 'IEEE 488.2 / SCPI Mandated',
      children: [],
    };
    IEEE4882MandatedCommands.forEach((c) => {
      const instruction: ItemInstruction = {
        ...c,
        _id: generateUuid(),
        file: 'json',
      };
      if (SCPIMandatedCategory.children)
        SCPIMandatedCategory.children.push(instruction);
    });
    (instructionsCategory.children as Item[]).unshift(SCPIMandatedCategory);
    const SCPIRequiredCategory: Item = { _id: generateUuid(), name: 'SCPI Required', children: [] };
    SCPIRequiredCommands.forEach((c) => {
      const instruction: ItemInstruction = {
        ...c,
        _id: generateUuid(),
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

  onCommandParametersBuilderDialogSave(opts: { parameters: CommandParameter[], parametersType: CommandParameterType }) {
    this.shouldCommandBuilderDialogShow = false;
    const instructionSet = this.$store.direct.state.driverBuilder.currentDriver.instructionSets[this.expandedInstructionSet];
    if (!instructionSet) return;
    console.info(opts);
    switch (opts.parametersType) {
      case 'pre':
        this.$store.direct.commit.driverBuilder.setDriverInstructionSetInstructionCommandPreParameters({
          instructionSetId: instructionSet._id,
          instruction: this.commandBuilderDialogInstruction,
          parameters: opts.parameters
        });
        break;
      case 'post':
        this.$store.direct.commit.driverBuilder.setDriverInstructionSetInstructionCommandPostParameters({
          instructionSetId: instructionSet._id,
          instruction: this.commandBuilderDialogInstruction,
          parameters: opts.parameters
        });
    }
  }

  onInstructionTableComponentEditPreParameters(opts: { instruction: Instruction, instructions: Instruction[]}) {
    this.commandBuilderDialogInstruction = opts.instruction;
    this.commandBuilderDialogInstructionCommandParameters = opts.instruction.preParameters ? opts.instruction.preParameters : [];
    this.commandBuilderDialogInstructionCommandParametersType = 'pre';
    this.commandBuilderDialogInstructionsWithReadResponse = opts.instructions.filter(i => i.responseName !== undefined);
    this.shouldCommandBuilderDialogShow = true;
  }

  onInstructionTableComponentEditPostParameters(opts: { instruction: Instruction, instructions: Instruction[]}) {
    this.commandBuilderDialogInstruction = opts.instruction;
    this.commandBuilderDialogInstructionCommandParameters = opts.instruction.postParameters ? opts.instruction.postParameters : [];
    this.commandBuilderDialogInstructionCommandParametersType = 'post';
    this.commandBuilderDialogInstructionsWithReadResponse = opts.instructions.filter(i => i.responseName !== undefined);
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
      _id: opts.originalInstructionSet._id,
      oldName: opts.originalInstructionSet.name,
      newName: opts.newName,
    });
  }

  removeInstructionSet(instructionSet: InstructionSet) {
    this.$store.direct.commit.driverBuilder.removeDriverInstructionSet(instructionSet._id);
  }

  onInstructionTableComponentInstructionAdded(instructionSet: InstructionSet, newInstruction: Instruction) {
    this.$store.direct.commit.driverBuilder.addNewDriverInstructionToSet({
      instructionSetId: instructionSet._id,
      newInstruction: newInstruction,
    });
  }

  onInstructionTableComponentInstructionUpdated(instructionSet: InstructionSet, instruction: Instruction) {
    this.$store.direct.commit.driverBuilder.updateDriverInstructionFromInstructionSet({ instructionSetId: instructionSet._id, instruction: instruction });
  }

  onInstructionTableComponentInstructionRemoved(instructionSet: InstructionSet, instruction: Instruction) {
    this.$store.direct.commit.driverBuilder.removeDriverInstructionFromInstructionSet({ instructionSetId: instructionSet._id, instructionId: instruction._id });
  }

  async onInstructionTableComponentReordered(instructionSet: InstructionSet, args: { instructions: Instruction[] }) {
    this.$store.direct.commit.driverBuilder.setInstructionSetInstructionsOrder({ instructionSetId: instructionSet._id, instructions: args.instructions });
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
    this.$store.direct.commit.driverBuilder.setCurrentDriverCategories(this.selectedCategories);
    await this.$store.direct.dispatch.driverBuilder.saveCurrentDriver();
    await this.$store.direct.dispatch.driverBuilder.refreshLibrary();
  }

  clearDriver() {
    this.$store.direct.commit.driverBuilder.clearCurrentDriver();
    this.selectedCategories = [];
    const categoryCheckboxes = document.getElementsByClassName('driver-category-checkbox');
    if (!categoryCheckboxes) return;
    for (const element of categoryCheckboxes) {
      const checkboxEl = element as HTMLInputElement;
      checkboxEl.checked = false;
    }
  }

  ensureCurrentDriverHasInstructionSetsMatchingSelectedCategories() {
    for (const selectedCategoryName of this.selectedCategories) {
      const category = this.availableCategories.find(c => c.name === selectedCategoryName);
      if (!category) continue;
      for (const instructionSetName of category.instructionSets) {
        const doesDriverHaveMatchingInstructionSet = this.driver.instructionSets.find(i => i.name === instructionSetName) !== undefined;
        if (doesDriverHaveMatchingInstructionSet) continue;
        this.$store.direct.commit.driverBuilder.addDriverInstructionSet({
          _id: generateUuid(),
          name: instructionSetName,
          instructions: []
        });
      }
    }
  }

  private settingCategoryCheckboxesFromDriver = false;

  onDriverAvailableCategoryCheckChanged(selectedCategory: DriverCategory, event: Event) {
    if (this.settingCategoryCheckboxesFromDriver) return;
    const checkboxEl = event.target as HTMLInputElement;
    const existingCategoryIndex = this.selectedCategories.findIndex(c => c === selectedCategory.name);
    const selectedCategories: string[] = [];
    this.selectedCategories.forEach(categoryName => selectedCategories.push(categoryName));
    if (checkboxEl.checked && existingCategoryIndex <= -1) {
      selectedCategories.push(selectedCategory.name);
    } else {
      selectedCategories.splice(existingCategoryIndex, 1);
    }
    this.selectedCategories = selectedCategories;
    this.ensureCurrentDriverHasInstructionSetsMatchingSelectedCategories();
  }

  @Watch('driver')
  onDriverChanged() {
    this.setCategoryCheckboxesFromDriver();
  }

  setCategoryCheckboxesFromDriver() {
    this.settingCategoryCheckboxesFromDriver = true;
    const categoryCheckboxes = document.getElementsByClassName('driver-category-checkbox');
    for (let index = 0; index < categoryCheckboxes.length; index++) {
      const checkbox = categoryCheckboxes[index] as HTMLInputElement;
      checkbox.checked = false;
    }
    const driverCategoryNames = this.$store.direct.state.driverBuilder.currentDriver.categories;
    if (!driverCategoryNames || driverCategoryNames.length <= 0) {
      this.settingCategoryCheckboxesFromDriver = false;
      return;
    }
    for (const driverCategoryName of driverCategoryNames) {
      const driverCategory = this.availableCategories.find(c => c.name === driverCategoryName);
      if (!driverCategory) continue;
      const checkboxEl = document.getElementById(`driver-category-${driverCategory._id}`) as HTMLInputElement | null;
      if (!checkboxEl) continue;
      checkboxEl.checked = true;
    }
    this.settingCategoryCheckboxesFromDriver = false;
  }

}
</script>

<style>
#driver-builder-editor-instruction-sets {
  overflow-y: scroll;
  max-height: calc(96vh - 70px - 178px - 60px - 250px);
}

#driver-builder-editor-instruction-sets::-webkit-scrollbar {
  display: block;
  width: 10px;
  height: 8px; /** Does't matter, but required to be visible */
  background-color: #aaa;
}

#driver-builder-editor-instruction-sets::-webkit-scrollbar-thumb {
  background: gray;
}

.driver-details-row {
  height: calc(96vh - 70px);
  max-height: calc(96vh - 70px);
}

.instruction-sets-row {
  height: calc(96vh - 70px - 178px - 60px - 100px);
  max-height: calc(96vh - 70px - 178px - 60px - 100px);
}

</style>
