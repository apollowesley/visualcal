<template>
<v-card
  class="card"
>
  <v-card-title primary-title>
    Procedures
  </v-card-title>
  <v-treeview
    v-model="fTree"
    :items="fProcedures"
    activatable
    hoverable
    item-key="name"
    return-object
    @update:active="onProceduresUpdateActive"
  >
    <template v-slot:prepend="{ item, open }">
      <v-icon v-if="item.type === 'procedure'">
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
      <v-icon v-else>
        {{ fFiles[item.type] }}
      </v-icon>
    </template>
  </v-treeview>
</v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import * as procedureIpcUtils from '../../utils/ipc';

@Component
export default class DashboardProceduresComponent extends Vue {

  private fTree: TreeItem[] = [];
  private fFiles = {
    'procedure-section': 'mdi-language-html5'
  };
  private fProcedures: TreeItem[] = [];

  mounted() {
    procedureIpcUtils.onGetProceduresResponse((_, procedures) => this.onGotProcedures(procedures), (_, err) => this.onGetProceduresError(err));
    this.refreshProcedures();
  }

  beforeDestroy() {
    procedureIpcUtils.removeAllListeners();
  }

  refreshProcedures() {
    procedureIpcUtils.getProcedures();
  }

  onGotProcedures(procedures: Procedure[]) {
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
      this.fProcedures.push(item);
    });
  }

  onGetProceduresError(err: Error) {
    this.$emit('error', err);
  }

  onProceduresUpdateActive(items: TreeItem[]) {
    this.$emit('active', items);
  }

}
</script>

<style>

</style>