<template>
  <v-container
    fluid
  >
    <v-row>
      <v-col>
        <v-row
          align="stretch"
        >
          <v-col cols="3">
            <v-card
              class="card"
            >
              <v-card-title primary-title>
                Explorer
              </v-card-title>
              <v-treeview
                v-model="fTree"
                :open="fOpen"
                :items="fItems"
                activatable
                item-key="name"
                open-on-click
              >
                <template v-slot:prepend="{ item, open }">
                  <v-icon v-if="!item.name">
                    {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                  </v-icon>
                  <v-icon v-else>
                    {{ fFiles[item.file] }}
                  </v-icon>
                </template>
              </v-treeview>
            </v-card>
          </v-col>
          <v-col>
            <v-card
              class="card"
            >
              <v-card-title primary-title>
                Content
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { getProcedures, Procedure, createProcedure } from '../utils/ipc';

interface TreeItem {
  name: string;
  file?: string;
  children?: TreeItem[];
}

@Component
export default class Dashboard extends Vue {

  private fTree: TreeItem[] = [];
  private fOpen: string[] = ['public'];
  private fFiles = {
    html: 'mdi-language-html5',
    js: 'mdi-nodejs',
    json: 'mdi-json',
    md: 'mdi-markdown',
    pdf: 'mdi-file-pdf',
    png: 'mdi-file-image',
    txt: 'mdi-file-document-outline',
    xls: 'mdi-file-excel',
  };
  private fItems: Procedure[] = [];

  async mounted() {
    await this.refreshProcedures();
  }

  async refreshProcedures() {
    await createProcedure({
      name: 'procedure1',
      sections: [
        {
          name: 'section1'
        }
      ]
    });
    const procedures = await getProcedures();
    if (!procedures) return;
    this.fItems = procedures;
  }

}
</script>

<style scoped>
.card {
  height: 90vh;
}
</style>