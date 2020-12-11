<template>
  <v-container class="grey" fluid fill-height>
    <RenameDialog
      v-model="fShouldShowRenameProcedureDialog"
      type="procedure"
      :old-name="fOldProcedureName"
      @rename="onRename"
    />
    <RemoveDialog
      v-model="fShouldShowRemoveProcedureDialog"
      :text="fRemoveProcedureText"
      :item-name="fRemoveProcedureName"
      type="procedure"
      @remove="onRemoveProcedureButtonClicked"
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
import { Vue, Component, Watch } from 'vue-property-decorator';
import TabulatorComponent from '@/components/Tabulator.vue';
import Tabulator from 'tabulator-tables';
import { Procedure } from 'visualcal-common/dist/session-view-info';
import RenameDialog from '@/components/RenameDialog.vue';
import RemoveDialog from '@/components/RemoveDialog.vue';

@Component({
  components: {
    TabulatorComponent,
    RenameDialog,
    RemoveDialog
  }
})
export default class ProcedureSelectView extends Vue {

  fProcedures: Procedure[] = [];
  fButtons: HTMLButtonElement[] = [];
  fShouldShowRenameProcedureDialog = false;
  fOldProcedureName = '';
  fShouldShowRemoveProcedureDialog = false;
  fRemoveProcedureText = '';
  fRemoveProcedureName = '';

  @Watch('fShouldShowRenameProcedureDialog')
  onfShouldShowRenameProcedureDialogChanged() {
    this.setAllButtonsDisableProp(false);
  }

  showRemoveDialog(procedureName: string) {
    this.fRemoveProcedureText = `Are you sure you want to delete procedure named "${ procedureName }"?`;
    this.fRemoveProcedureName = procedureName;
    this.fShouldShowRemoveProcedureDialog = true;
  }

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
    this.fShouldShowRemoveProcedureDialog = false;
    this.setAllButtonsDisableProp(true);
    try {
      await window.ipc.removeProcedure(procedureName);
    } catch (error) {
      alert(error.message);
    }
    this.setAllButtonsDisableProp(false);
    this.fProcedures = await window.ipc.getProcedures();
  }

  private createColumnButton(cell: Tabulator.CellComponent, label: string, onClick: (procedureName: string) => void) {
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
      { title: '', width: '10%', formatter: (cell) => this.createColumnButton(cell, 'Select', this.onSelectProcedureButtonClicked) },
      { title: '', width: '10%', formatter: (cell) => this.createColumnButton(cell, 'Rename', this.onRenameProcedureButtonClicked) },
      { title: '', width: '10%', formatter: (cell) => this.createColumnButton(cell, 'Remove', this.showRemoveDialog) }
  ];

  async mounted() {
    this.fProcedures = await window.ipc.getProcedures();
  }

  async onRename(newName: string) {
    this.fShouldShowRenameProcedureDialog = false;
    this.setAllButtonsDisableProp(false);
    try {
      await window.ipc.renameProcedure(this.fOldProcedureName, newName);
    } catch (error) {
      alert(error.message);
    }
    this.fProcedures = await window.ipc.getProcedures();
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
