<template>
<v-card
  class="card"
>
  <v-card-title primary-title>
    Procedures
  </v-card-title>
  <v-virtual-scroll
    :items="fProcedures"
    item-height="30"
    height="600"
    activatable
    hoverable
    item-key="name"
    return-object
    @update:active="onProceduresUpdateActive"
  >
    <template v-slot="{ item }">
      <v-list-item>
        <v-icon>{{ fTreeItemTypes[item.type] }}</v-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn
            depressed
            small
          >
            Edit
            <v-icon
              color="orange darken-4"
              right
            >
              mdi-open-in-new
            </v-icon>
          </v-btn>
          <v-btn
            depressed
            small
          >
            Run
            <v-icon
              color="orange darken-4"
              right
            >
              mdi-open-in-new
            </v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </template>
  </v-virtual-scroll>
</v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import * as procedureIpcUtils from '../../utils/ipc';

@Component
export default class DashboardProceduresComponent extends Vue {

  private fTree: Procedure[] = [];
  private fTreeItemTypes = {
    'procedure': 'mdi-language-html5'
  };
  private fProcedures: Procedure[] = [];

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
      for (let index = 0; index < 200; index++) {
        this.fProcedures.push(proc);
      }
    });
  }

  onGetProceduresError(err: Error) {
    this.$emit('error', err);
  }

  onProceduresUpdateActive(procedures: Procedure[]) {
    this.$emit('active', procedures);
  }

}
</script>

<style>

</style>