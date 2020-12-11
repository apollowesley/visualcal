<template>
  <v-container class="grey" fluid fill-height>
    <RenameDialog
      v-model="fShouldShowRenameSessionDialog"
      type="Session"
      :old-name="fOldSessionName"
      @rename="onRename"
    />
    <RemoveDialog
      v-model="fShouldShowRemoveSessionDialog"
      :text="fRemoveSessionText"
      :item-name="fRemoveSessionName"
      type="session"
      @remove="onRemoveButtonClicked"
    />
    <v-row no-gutters>
      <v-col>
        <h2>Select a session</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <TabulatorComponent
          :columns="columns"
          layout="fitColumns"
          :show-row-hover="false"
          :data="fSessions"
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
          :to="{ name: 'SessionCreate' }"
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
import { Session } from 'visualcal-common/dist/session-view-info';
import { User } from '@/types/session';
import RenameDialog from '@/components/RenameDialog.vue';
import RemoveDialog from '@/components/RemoveDialog.vue';

@Component({
  components: {
    TabulatorComponent,
    RenameDialog,
    RemoveDialog
  }
})
export default class SessionSelectView extends Vue {

  fButtons: HTMLButtonElement[] = [];
  procedureName = '';
  user?: User;
  fSessions: Session[] = [];
  fSelectSessionButtons: HTMLButtonElement[] = [];
  fShouldShowRenameSessionDialog = false;
  fOldSessionName = '';
  fShouldShowRemoveSessionDialog = false;
  fRemoveSessionText = '';
  fRemoveSessionName = '';

  get userEmail() { return this.user ? this.user.email : ''; }

  showRemoveDialog(sessionName: string) {
    this.fRemoveSessionText = `Are you sure you want to delete session named "${ sessionName }"?`;
    this.fRemoveSessionName = sessionName;
    this.fShouldShowRemoveSessionDialog = true;
  }

  private setSelectSessionButtonsDisabled(disabled: boolean) {
    for (const button of this.fSelectSessionButtons) {
      button.disabled = disabled;
    }
  }

  @Watch('fShouldShowRenameSessionDialog')
  onfShouldShowRenameSessionDialogChanged() {
    if (!this.fShouldShowRenameSessionDialog) this.setSelectSessionButtonsDisabled(false);
  }

  private async onSelectSessionButtonClicked(sessionName: string) {
    this.setSelectSessionButtonsDisabled(true);
    await window.ipc.setActiveSession(this.userEmail, sessionName, this.procedureName);
    this.setSelectSessionButtonsDisabled(false);
  }

  private createSelectSessionColumnButton(cell: Tabulator.CellComponent) {
    const button = document.createElement('button') as HTMLButtonElement;
    button.textContent = 'Select';
    button.style.backgroundColor = '#b5b5b5';
    button.style.marginLeft = '7px';
    button.style.marginRight = '7px';
    button.style.padding = '7px';
    button.style.width = '90%';
    button.style.boxShadow = '2px 2px #888888';
    button.id = (cell.getRow().getData() as Session).name;
    button.onclick = async () => await this.onSelectSessionButtonClicked(button.id);
    this.fSelectSessionButtons.push(button);
    return button;
  }
  private async onSelectButtonClicked(sessionName: string) {
    this.setSelectSessionButtonsDisabled(true);
    await window.ipc.setActiveSession(this.userEmail, sessionName, this.procedureName);
  }

  private async onRenameButtonClicked(sessionName: string) {
    this.setSelectSessionButtonsDisabled(true);
    this.fOldSessionName = sessionName;
    this.fShouldShowRenameSessionDialog = true;
  }

  private async onRemoveButtonClicked(sessionName: string) {
    this.fShouldShowRemoveSessionDialog = false;
    this.setSelectSessionButtonsDisabled(true);
    try {
      await window.ipc.removeSession(this.userEmail, this.procedureName, sessionName);
    } catch (error) {
      alert(error.message);
    }
    this.setSelectSessionButtonsDisabled(false);
    const allActiveUserSessions = await window.ipc.getAllSessionsForActiveUser();
    this.fSessions = allActiveUserSessions.filter(s => s.procedureName === this.procedureName);
  }

  private createColumnButton(cell: Tabulator.CellComponent, label: string, onClick: (sessionName: string) => void) {
    const procedure = cell.getRow().getData() as Session;
    const button = document.createElement('button') as HTMLButtonElement;
    button.textContent = label;
    button.style.backgroundColor = '#b5b5b5';
    button.style.marginLeft = '3px';
    button.style.marginRight = '3px';
    button.style.paddingTop = '3px';
    button.style.paddingBottom = '3px';
    button.style.width = '90%';
    button.style.boxShadow = '2px 2px #888888';
    button.id = `session.name-${label}`;
    button.onclick = async () => await onClick(procedure.name);
    this.fButtons.push(button);
    return button;
  }

  columns: Tabulator.ColumnDefinition[] = [
      { title: 'Name', field: 'name', width: '35%' },
      { title: 'Procedure', field: 'procedureName', width: '35%' },
      { title: '', width: '10%', formatter: (cell) => this.createColumnButton(cell, 'Select', this.onSelectButtonClicked) },
      { title: '', width: '10%', formatter: (cell) => this.createColumnButton(cell, 'Rename', this.onRenameButtonClicked) },
      { title: '', width: '10%', formatter: (cell) => this.createColumnButton(cell, 'Remove', this.showRemoveDialog) }
  ];

  async mounted() {
    const user = await window.ipc.getCurrentUser();
    this.user = user ? user : undefined;
    this.procedureName = await window.ipc.getActiveProcedureName();
    this.fSessions = (await window.ipc.getAllSessionsForActiveUser()).filter(s => s.procedureName === this.procedureName);
  }

  async onRename(newName: string) {
    this.fShouldShowRenameSessionDialog = false;
    try {
      await window.ipc.renameSession(this.userEmail, this.procedureName, this.fOldSessionName, newName);
    } catch (error) {
      alert(error.message);
    }
    this.fSessions = (await window.ipc.getAllSessionsForActiveUser()).filter(s => s.procedureName === this.procedureName);
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
