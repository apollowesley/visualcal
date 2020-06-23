<template>
  <v-container
    fluid
  >
    <v-snackbar
      v-model="fAlert"
      dismissible
      block
      dark
      top
      color="error"
      timeout="4000"
    >
      {{ fAlertMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="gray"
          v-bind="attrs"
          @click="fAlert = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
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
                hoverable
                item-key="name"
                return-object
              >
                <template v-slot:prepend="{ item, open }">
                  <v-icon v-if="item.type === 'parent' || item.type === 'procedure'">
                    {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                  </v-icon>
                  <v-icon v-else>
                    {{ fFiles[item.type] }}
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
import { getProcedures, createProcedure } from '../utils/ipc';

declare type TreeItemType = 'parent' | 'procedure' | 'procedure-section';

interface TreeItem {
  name: string;
  type: TreeItemType;
  children?: TreeItem[];
}

@Component
export default class Dashboard extends Vue {

  private fAlert: boolean = false;
  private fAlertMessage: string = '';
  private fTree: TreeItem[] = [];
  private fOpen: string[] = ['public'];
  private fFiles = {
    'procedure-section': 'mdi-language-html5',
    js: 'mdi-nodejs',
    json: 'mdi-json',
    md: 'mdi-markdown',
    pdf: 'mdi-file-pdf',
    png: 'mdi-file-image',
    txt: 'mdi-file-document-outline',
    xls: 'mdi-file-excel',
  };
  private fItems: TreeItem[] = [
    {
      name: 'Procedures',
      type: 'parent',
      children: []
    },
    {
      name: 'Drivers',
      type: 'parent',
      children: []
    }
  ];

  async mounted() {
    await this.refreshProcedures();
  }

  async refreshProcedures() {
    try {
      await createProcedure({
        name: 'procedure1',
        sections: [
          {
            name: 'section1'
          }
        ]
      });
    } catch (error) {
      this.fAlertMessage = error.message;
      this.fAlert = true;
    }
    const procedures = await getProcedures();
    if (!procedures) return;
    procedures.forEach(proc => {
      const item: TreeItem = {
        name: proc.name,
        type: 'procedure',
      };
      if (proc.sections && proc.sections.length > 0) {
        item.children = [];
        proc.sections.forEach(section => {
          if (item.children) item.children.push({
            name: section.name,
            type: 'procedure-section'
          })
        });
      }
      const procedureParent = this.fItems.find(item => item.name === 'Procedures');
      if (procedureParent && procedureParent.children) procedureParent.children.push(item);
    });
  }

}
</script>

<style scoped>
.card {
  height: 90vh;
}
</style>