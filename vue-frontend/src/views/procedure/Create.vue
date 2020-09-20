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
            <h2>Create a procedure</h2>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
          >
            <v-text-field
              v-model="procedure.name"
              label="Name"
              v-debounce:300="onProcedureNameChanged"
              :error="procedureExists"
              :hint="nameHint"
              persistent-hint
            />
          </v-col>
          <v-col
            cols="12"
          >
            <v-text-field
              v-model="procedure.description"
              label="Description"
            />
          </v-col>
          <v-col
            cols="4"
          >
            <v-text-field
              v-model="procedure.version"
              label="Version"
              hint="Example '0.1.0'"
              persistent-hint
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
              :to="{ name: 'ProcedureSelect' }"
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
import { ProcedureForCreate } from 'visualcal-common/types/procedure';

@Component
export default class ProcedureCreateView extends Vue {

  shouldDisableCreateButton = true;
  procedureExists = false;
  procedure: ProcedureForCreate = {
    name: '',
    description: '',
    version: ''
  }

  get nameHint() {
    if (this.procedureExists) return 'Procedure already exists';
    return '';
  }

  async checkProcedureExists(procedureName: string) {
    return await window.ipc.getProcedureExists(procedureName);
  }

  async onProcedureNameChanged() {
    this.procedureExists = await this.checkProcedureExists(this.procedure.name);
    this.shouldDisableCreateButton = this.procedure.name.length <= 0 || this.procedureExists;
    
  }

  async onCreateButtonClicked() {
    await window.ipc.createProcedure(this.procedure);
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
