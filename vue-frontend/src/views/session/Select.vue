<template>
  <v-container class="grey" fluid fill-height>
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
import { Vue, Component } from 'vue-property-decorator';
import TabulatorComponent from '@/components/Tabulator.vue';
import Tabulator from 'tabulator-tables';
import { Session } from 'visualcal-common/dist/session-view-info';
import { User } from '@/types/session';

@Component({
  components: {
    TabulatorComponent
  }
})
export default class SessionSelectView extends Vue {

  procedureName = '';
  user?: User;
  fSessions: Session[] = [];
  fSelectSessionButtons: HTMLButtonElement[] = [];

  get userEmail() { return this.user ? this.user.email : ''; }

  private setSelectSessionButtonsDisabled(disabled: boolean) {
    for (const button of this.fSelectSessionButtons) {
      button.disabled = disabled;
    }
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

  columns: Tabulator.ColumnDefinition[] = [
      { title: 'Name', field: 'name', width: '40%' },
      { title: 'Procedure', field: 'procedureName', width: '40%' },
      { title: '', formatter: this.createSelectSessionColumnButton }
  ];

  async mounted() {
    const user = await window.ipc.getCurrentUser();
    this.user = user ? user : undefined;
    this.procedureName = await window.ipc.getActiveProcedureName();
    this.fSessions = (await window.ipc.getAllSessionsForActiveUser()).filter(s => s.procedureName === this.procedureName);
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
