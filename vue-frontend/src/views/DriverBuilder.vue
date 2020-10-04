<template>
  <v-container fluid class="grey" style="height: 100vh">
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
            <h4>Templates</h4>
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
            </v-treeview>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <MainTableComponent style="height: 100%; width: 100%" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MainTableComponent from '@/components/driver-builder/MainTable.vue';
import { Instruction, IEEE4882MandatedCommands, SCPIRequiredCommands } from '@/driver-builder';

interface ItemInstruction extends Instruction {
  name: string;
  file?: string;
}

interface Item {
  name: string;
  children?: Item[] | ItemInstruction[];
  file?: string;
}

@Component({
  components: {
    MainTableComponent
  }
})
export default class DriverBuilderView extends Vue {

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
    { name: 'Digital Multimeter', file: 'fold' },
    { name: 'Signal Generator' },
    { name: 'Waveform Generator' }
  ]
 
  mounted() {
    const SCPIMandatedCategory: Item = { name: 'IEEE 488.2 / SCPI Mandated', children: [] };
    IEEE4882MandatedCommands.forEach(c => {
      const instruction: ItemInstruction = {
        ...c,
        file: 'json'
      }
      if (SCPIMandatedCategory.children) SCPIMandatedCategory.children.push(instruction);
    });
    this.items.unshift(SCPIMandatedCategory);
    const SCPIRequiredCategory: Item = { name: 'SCPI Required', children: [] };
    SCPIRequiredCommands.forEach(c => {
      const instruction: ItemInstruction = {
        ...c,
        file: 'json'
      }
      if (SCPIRequiredCategory.children) SCPIRequiredCategory.children.push(instruction);
    });
    this.items.unshift(SCPIRequiredCategory);
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
