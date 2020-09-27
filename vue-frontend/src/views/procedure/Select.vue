<template>
  <v-container class="grey" fluid fill-height>
    <v-row no-gutters>
      <v-col>
        <h2>Select a procedure</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <TabulatorComponent
          :columns="columns"
          layout="fitColumns"
          :show-row-hover="false"
          :data="fProcedures"
        />
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <h2>Or create a new one</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          :to="{ name: 'ProcedureCreate' }"
        >
          Create
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TabulatorComponent from '@/components/Tabulator.vue';
import Tabulator from 'tabulator-tables';
import { Procedure } from 'visualcal-common/dist/session-view-info';

@Component({
  components: {
    TabulatorComponent
  }
})
export default class ProcedureSelectView extends Vue {

  fProcedures: Procedure[] = [];
  fSelectProcedureButtons: HTMLButtonElement[] = [];

  private setSelectProcedureButtonsDisabled(disabled: boolean) {
    for (const button of this.fSelectProcedureButtons) {
      button.disabled = disabled;
    }
  }

  private async onSelectProcedureButtonClicked(procedureName: string) {
    this.setSelectProcedureButtonsDisabled(true);
    await window.ipc.setActiveProcedure(procedureName);
    this.$router.push({ name: 'ProcedureLoadingServices' });
  }

  private createSelectProcedureColumnButton(cell: Tabulator.CellComponent) {
    const button = document.createElement('button') as HTMLButtonElement;
    button.textContent = 'Select';
    button.style.backgroundColor = '#b5b5b5';
    button.style.marginLeft = '7px';
    button.style.marginRight = '7px';
    button.style.padding = '7px';
    button.style.width = '90%';
    button.style.boxShadow = '2px 2px #888888';
    button.id = (cell.getRow().getData() as Procedure).name;
    button.onclick = async () => await this.onSelectProcedureButtonClicked((cell.getRow().getData() as Procedure).name);
    this.fSelectProcedureButtons.push(button);
    return button;
  }

  columns: Tabulator.ColumnDefinition[] = [
      { title: 'Name', field: 'name', width: '40%' },
      { title: 'Organization', field: 'authorOrganization', width: '40%' },
      { title: '', formatter: this.createSelectProcedureColumnButton }
  ];

  async mounted() {
    this.fProcedures = await window.ipc.getProcedures();
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
