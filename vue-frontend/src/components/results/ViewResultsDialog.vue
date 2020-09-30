<template>
  <v-row justify="center">
    <v-dialog
      v-model="shouldShow"
      max-width="1200"
    >
      <v-card>
        <v-card-title class="headline">
          Run Results
        </v-card-title>
        <v-card-text>Run description:  {{ run ? run.description : '' }}</v-card-text>
      <v-container>
        <v-row no-gutters>
          <v-col>
            <h2>Interfaces</h2>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
          <TabulatorComponent
            :columns="columns"
            layout="fitData"
            :show-row-hover="false"
            :data="results"
          />
          </v-col>
        </v-row>
      </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            @click="cancel"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import { LogicRun } from 'visualcal-common/src/result';
import { Vue, Component, Prop } from 'vue-property-decorator';
import TabulatorComponent from '@/components/Tabulator.vue';

@Component({
  components: {
    TabulatorComponent
  }
})
export default class ViewResultsDialogComponent extends Vue {

  @Prop({ type: Boolean, required: true }) shouldShow!: boolean;
  @Prop({ type: Object, required: false }) run?: LogicRun<string, number>;

  columns: Tabulator.ColumnDefinition[] = [
    { title: 'Timestamp', field: 'timestamp' },
    { title: 'Description', field: 'description' },
    { title: 'Base EU', field: 'baseQuantity' },
    { title: 'Derived EU', field: 'derivedQuantity' },
    { title: 'Nominal', field: 'inputLevel' },
    { title: 'Minimum', field: 'minimum' },
    { title: 'Maximum', field: 'maximum' },
    { title: 'Raw', field: 'rawValue' },
    { title: 'Measured', field: 'measuredValue' },
    { title: 'Passed', field: 'passed' }
  ];

  get results() { return this.run ? this.run.results : []; }

  cancel() {
    this.$emit('cancel');
  }

}
</script>

<style>

</style>
