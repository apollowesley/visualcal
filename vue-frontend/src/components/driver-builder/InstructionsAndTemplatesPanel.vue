<template>
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
          style="height: 92vh; width: 100%; background: white; font-size: 14px; max-height: 92vh; overflow-y: auto;"
          activatable
          item-key="_id"
          open-on-click
          dense
        >
          <template v-slot="{ item }">
            {{ item.name }}
          </template>
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
            <v-label
              v-else-if="item.instructionSet"
              @contextmenu="instructionSetRightClicked($event, item.instructionSet)"
            >
              {{ item.name }}
            </v-label>
            <v-label
              v-else-if="item.driver"
              @contextmenu="driverRightClicked($event, item.driver)"
            >
              {{ item.name }}
            </v-label>
            <label v-else>
              {{ item.name }}
            </label>
          </template>
        </v-treeview>
        <v-menu
          v-model="shouldInstructionSetContextMenuShow"
          :position-x="itemMouseX"
          :position-y="itemMouseY"
          absolute
          offset-y
        >
          <v-list>
            <v-list-item
              @click="addItemInstructionSet"
            >
              <v-list-item-title>Add to driver</v-list-item-title>
            </v-list-item>
            <v-list-item
              @click="removeInstructionSetFromLibrary"
            >
              <v-list-item-title>Remove</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-menu
          v-model="shouldDriverContextMenuShow"
          :position-x="itemMouseX"
          :position-y="itemMouseY"
          absolute
          offset-y
        >
          <v-list>
            <v-list-item
              @click="setDriverAsCurrent"
            >
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>
            <v-list-item
              @click="saveDriverToStore"
            >
              <v-list-item-title>Save to store</v-list-item-title>
            </v-list-item>
            <v-list-item
              @click="removeDriverFromLibrary"
            >
              <v-list-item-title>Remove</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import { generateUuid } from '@/utils/uuid';
import { Driver, Instruction, InstructionSet } from 'visualcal-common/src/driver-builder';
import { Item } from './InstructionsAndTemplatesItemInterfaces';

@Component
export default class InstructionsAndTemplatesPanelComponent extends Vue {

  @Prop({ type: Array, required: true }) items!: Item[];

  itemDriver?: Driver;
  itemInstructionSet?: InstructionSet;
  shouldInstructionSetContextMenuShow = false;
  shouldDriverContextMenuShow = false;
  itemMouseX = 0;
  itemMouseY = 0;
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

  get drivers() { return this.$store.direct.state.driverBuilder.drivers; }
  get instructionSets() { return this.$store.direct.state.driverBuilder.instructionSets; }
  get onlineStoreDrivers() { return this.$store.direct.state.driverBuilder.onlineStore.drivers; }

  @Watch('onlineStoreDrivers', { deep: true })
  onOnlineStoreDriversChanged() {
    this.refreshOnlineStoreCategory();
  }

  @Watch('drivers', { deep: true })
  onDriversChanged() {
    this.refreshDriversCategory();
  }

  @Watch('instructionSets', { deep: true })
  onInstructionSetsChanged() {
    this.refreshInstructionSetsCategory();
  }

  refreshInstructionSetsCategory() {
    let instructionSetsCategory = (this.items as Item[]).find(i => i.name === 'Your Instruction Sets');
    let addCategory = instructionSetsCategory === undefined;
    if (!instructionSetsCategory) instructionSetsCategory = { _id: generateUuid(), name: 'Your Instruction Sets', children: [] };
    instructionSetsCategory.children = [];
    for (const instructionSet of this.instructionSets) {
      (instructionSetsCategory.children as unknown[]).push({
        _id: instructionSet._id,
        name: instructionSet.name,
        file: 'json',
        instructionSet: { ...instructionSet }
      });
    }
    if (addCategory) this.items.push(instructionSetsCategory);
  }

  refreshDriversCategory() {
    const driversCategory = (this.items as Item[]).find(i => i.name === 'Drivers');
    if (!driversCategory) return;
    driversCategory.children = [];
    for (const driver of this.drivers) {
      let manufacturerItem = (driversCategory.children as Item[]).find(c => c.name === driver.driverManufacturer);
      if (!manufacturerItem) {
        manufacturerItem = {
          _id: generateUuid(),
          name: driver.driverManufacturer,
          children: []
        };
        (driversCategory.children as Item[]).push(manufacturerItem);
      }
      let modelItem = (manufacturerItem.children as Item[]).find(c => c.name === driver.driverModel);
      if (!modelItem) {
        modelItem = {
          _id: generateUuid(),
          name: driver.driverModel,
          children: []
        };
        (manufacturerItem.children as Item[]).push(modelItem);
      }
      const driverItem = {
        _id: generateUuid(),
        name: 'Driver',
        file: 'json',
        driver: { ...driver }
      };
      (modelItem.children as Item[]).push(driverItem);
    }
  }

  refreshOnlineStoreCategory() {
    let onlineStoreCategory = (this.items as Item[]).find(i => i.name === 'Store');
    let addCategory = onlineStoreCategory === undefined;
    if (!onlineStoreCategory) onlineStoreCategory = { _id: generateUuid(), name: 'Store', children: [] };
    onlineStoreCategory.children = [];
    for (const driver of this.$store.direct.state.driverBuilder.onlineStore.drivers) {
      let nomenclatureFolder = onlineStoreCategory.children ? (onlineStoreCategory.children as Item[]).find(c => c.name === driver.driverNomenclature) : undefined;
      if (!nomenclatureFolder) {
        nomenclatureFolder = {
          _id: driver._id,
          name: driver.driverNomenclature,
          children: []
        };
        (onlineStoreCategory.children as Item[]).push(nomenclatureFolder);
      }

      let manufacturerFolder = nomenclatureFolder.children ? (nomenclatureFolder.children as Item[]).find(c => c.name === driver.driverManufacturer) : undefined;
      if (!manufacturerFolder) {
        manufacturerFolder = {
          _id: driver._id,
          name: driver.driverManufacturer,
          children: []
        };
        (nomenclatureFolder.children as Item[]).push(manufacturerFolder);
      }

      let modelFolder = manufacturerFolder.children ? (manufacturerFolder.children as Item[]).find(c => c.name === driver.driverModel) : undefined;
      if (!modelFolder) {
        modelFolder = {
          _id: driver._id,
          name: driver.driverModel,
          children: []
        };
        (manufacturerFolder.children as Item[]).push(modelFolder);
      }

      (modelFolder.children as Item[]).push({
        _id: driver._id,
        name: 'Driver',
        file: 'json'
      });
    }
    if (addCategory) this.items.push(onlineStoreCategory);
  }

  onDragStart(event: DragEvent, instruction: Instruction) {
    if (!event || !event.dataTransfer) return;
    const instructionString = JSON.stringify(instruction);
    event.dataTransfer.dropEffect = 'copy';
    event.dataTransfer.setData('application/json', instructionString);
  }

  async instructionSetRightClicked(event: MouseEvent, instructionSet: InstructionSet) {
    event.preventDefault();
    this.shouldInstructionSetContextMenuShow = false;
    this.itemMouseX = event.clientX;
    this.itemMouseY = event.clientY;
    await this.$nextTick();
    this.shouldInstructionSetContextMenuShow = true;
    this.itemInstructionSet = instructionSet;
  }

  async driverRightClicked(event: MouseEvent, driver: Driver) {
    event.preventDefault();
    this.shouldDriverContextMenuShow = false;
    this.itemMouseX = event.clientX;
    this.itemMouseY = event.clientY;
    await this.$nextTick();
    this.shouldDriverContextMenuShow = true;
    this.itemDriver = driver;
  }

  addItemInstructionSet() {
    if (!this.itemInstructionSet) return;
    this.$store.direct.commit.driverBuilder.addDriverInstructionSet(this.itemInstructionSet);
  }

  async removeInstructionSetFromLibrary() {
    if (!this.itemInstructionSet) return;
    this.$store.direct.commit.driverBuilder.removeInstructionSetFromLibrary(this.itemInstructionSet);
    await this.$store.direct.dispatch.driverBuilder.saveLibrary();
  }

  setDriverAsCurrent() {
    if (!this.itemDriver) return;
    this.$store.direct.commit.driverBuilder.setCurrentDriver(this.itemDriver);
    this.itemDriver = undefined;
  }

  async saveDriverToStore() {
    if (!this.itemDriver) return;
    await this.$store.direct.dispatch.driverBuilder.saveDriverToStore(this.itemDriver);
  }

  async removeDriverFromLibrary() {
    if (!this.itemDriver) return;
    this.$store.direct.commit.driverBuilder.removeDriverFromLibrary(this.itemDriver);
    await this.$store.direct.dispatch.driverBuilder.saveLibrary();
    this.itemDriver = undefined;
  }

}
</script>

<style>

</style>