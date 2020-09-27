<template>
  <v-container class="grey" fill-height>
    <v-row
      class="ma-10"
    >
      <v-col
        class="text-center"
      >
        <v-row>
          <v-col>
            <h2>Create a session for procedure</h2>
            <h2>Selected procedure: {{ procedureName }}</h2>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
          >
            <v-text-field
              v-model="session.name"
              label="Name"
              v-debounce:100="onSessionNameChanged"
              :error="sessionExists"
              :hint="nameHint"
              persistent-hint
            />
          </v-col>
          <v-col
            cols="12"
          >
            <v-text-field
              v-model="session.description"
              label="Description"
            />
          </v-col>
        </v-row>
        <v-row
          class="text-center"
        >
          <v-col>
            <v-btn
              :disabled="shouldDisableCreateButton"
              @click.prevent="onCreateButtonClicked"
            >
              Create
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              :to="{ name: 'SessionSelect' }"
            >
              Cancel
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { SessionForCreate } from 'visualcal-common/dist/session';
import { User } from '@/types/session';

@Component
export default class SessionCreateView extends Vue {

  user?: User;
  procedureName = '';
  shouldDisableCreateButton = true;
  sessionExists = false;
  session: SessionForCreate = {
    name: '',
    procedureName: '',
    description: '',
    username: ''
  }

  get userEmail() { return this.user ? this.user.email : ''; }

  get nameHint() {
    if (this.sessionExists) return 'Session already exists';
    return '';
  }

  async mounted() {
    const user = await window.ipc.getCurrentUser();
    this.user = user ? user : undefined;
    console.info('user', this.user);
    this.procedureName = await window.ipc.getActiveProcedureName();
  }

  async checkSessionExists(sessionName: string) {
    return await window.ipc.getSessionExists(this.userEmail, sessionName);
  }

  async onSessionNameChanged() {
    this.sessionExists = await this.checkSessionExists(this.session.name);
    this.shouldDisableCreateButton = this.session.name.length <= 0 || this.sessionExists;
    
  }

  async onCreateButtonClicked() {
    this.session.username = this.userEmail;
    this.session.procedureName = this.procedureName;
    try {
      await window.ipc.createSession(this.session);
    } catch (error) {
      alert(error.message);
    }
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
