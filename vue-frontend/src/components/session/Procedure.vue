<template>
  <v-container
    fluid
    class="pt-0 pb-0"
  >
    <v-row>
      <v-col
        cols="3"
      >
        <v-select
          :items="sections"
          v-model="selectedSection"
          label="Section"
          item-text="name"
          return-object
          required
        />
      </v-col>
      <v-col
        cols="3"
      >
        <v-select
          :items="actions"
          v-model="selectedAction"
          label="Action"
          item-text="name"
          return-object
          required
        />
      </v-col>
      <v-col
        cols="5"
      >
        <v-text-field
          v-model="fRunName"
          label="Run name"
          hint="You can name this run or leave it blank.  It will default to ISO date/time."
          persistent-hint
        />
      </v-col>
      <v-col
        cols="1"
      >
        <v-btn
          :disabled="canRunAction"
          label="Action"
          @click.prevent="onStartStopSelectedAction"
        >
          Start
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ProcedureSection, ProcedureAction } from 'visualcal-common/dist/session-view-info';

@Component
export default class SessionProcedureComponent extends Vue {

  private fRunName = '';

  get sessionViewInfo() { return this.$store.direct.state.sessionViewInfo; }
  get procedure() { return this.sessionViewInfo ? this.sessionViewInfo.procedure : null; }

  get selectedSection() { return this.$store.direct.state.selectedSection; }
  set selectedSection(value: ProcedureSection | null) {
    this.$store.direct.commit.setSelectedSection(value);
    if (!value || value.actions.length <= 0) return;
    this.selectedAction = value.actions[0];
  }

  get selectedAction() { return this.$store.direct.state.selectedAction; }
  set selectedAction(value: ProcedureAction | null) { this.$store.direct.commit.setSelectedAction(value); }

  get sections() { return this.procedure ? this.procedure.sections : []; }
  get actions() { return this.selectedSection ? this.selectedSection.actions : []; }

  get canRunAction() { return this.procedure && this.procedure.sections.length <= 0; }

  onStartStopSelectedAction() {
    alert('I\'m running!');
  }

}
</script>

<style>

</style>
