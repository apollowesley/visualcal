<template>
  <v-container class="grey" fluid fill-height>
    <RenameProcedureDialog
      v-model="fShouldShowRenameProcedureDialog"
      :old-name="fOldProcedureName"
      @renamed="onProcedureRenamed"
    />
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
import RenameProcedureDialog from '@/components/procedure/RenameDialog.vue';

@Component({
  components: {
    TabulatorComponent,
    RenameProcedureDialog
  }
})
export default class ProcedureSelectView extends Vue {

  fProcedures: Procedure[] = [];
  fButtons: HTMLButtonElement[] = [];
  fShouldShowRenameProcedureDialog = false;
  fOldProcedureName = '';

  private setAllButtonsDisableProp(disable: boolean) {
    for (const button of this.fButtons) {
      button.disabled = disable;
    }
  }

  private async onSelectProcedureButtonClicked(procedureName: string) {
    this.setAllButtonsDisableProp(true);
    await window.ipc.setActiveProcedure(procedureName);
    this.$router.push({ name: 'ProcedureLoadingServices' });
  }

  private async onRenameProcedureButtonClicked(procedureName: string) {
    this.setAllButtonsDisableProp(true);
    this.fOldProcedureName = procedureName;
    this.fShouldShowRenameProcedureDialog = true;
  }

  private async onRemoveProcedureButtonClicked(procedureName: string) {
    this.setAllButtonsDisableProp(true);
    await window.ipc.removeProcedure(procedureName);
    this.setAllButtonsDisableProp(false);
    this.fProcedures = await window.ipc.getProcedures();
  }

  private createSelectProcedureColumnButton(cell: Tabulator.CellComponent, label: string, onClick: (procedureName: string) => void) {
    const procedure = cell.getRow().getData() as Procedure;
    const button = document.createElement('button') as HTMLButtonElement;
    button.textContent = label;
    button.style.backgroundColor = '#b5b5b5';
    button.style.marginLeft = '3px';
    button.style.marginRight = '3px';
    button.style.paddingTop = '3px';
    button.style.paddingBottom = '3px';
    button.style.width = '90%';
    button.style.boxShadow = '2px 2px #888888';
    button.id = `procedure.name-${label}`;
    button.onclick = async () => await onClick(procedure.name);
    this.fButtons.push(button);
    return button;
  }

  columns: Tabulator.ColumnDefinition[] = [
      { title: 'Name', field: 'name', width: '70%' },
      { title: '', width: '10%', formatter: (cell) => this.createSelectProcedureColumnButton(cell, 'Select', this.onSelectProcedureButtonClicked) },
      { title: '', width: '10%', formatter: (cell) => this.createSelectProcedureColumnButton(cell, 'Rename', this.onRenameProcedureButtonClicked) },
      { title: '', width: '10%', formatter: (cell) => this.createSelectProcedureColumnButton(cell, 'Remove', this.onRemoveProcedureButtonClicked) },
  ];

  async mounted() {
    this.fProcedures = await window.ipc.getProcedures();
  }

  async onProcedureRenamed() {
    this.fShouldShowRenameProcedureDialog = false;
    this.setAllButtonsDisableProp(false);
    this.fProcedures = await window.ipc.getProcedures();
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
