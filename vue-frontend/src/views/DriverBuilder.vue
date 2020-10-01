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
      style="height: 96vh"
    >
      <v-col
        cols="auto"
      >
        <v-treeview
          v-model="tree"
          :open="open"
          :items="items"
          style="height: 100%; width: 100%; background: white"
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
      <v-col>
        <MainTableComponent style="height: 100%; width: 100%" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MainTableComponent from '@/components/driver-builder/MainTable.vue';

interface Item {
  name: string;
  children?: Item[];
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

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
