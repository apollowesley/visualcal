<template>
  <v-container
    fluid
  >
    <v-row
      no-gutters
    >
      <v-col>
        <div
          ref="resultsTable"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';

@Component
export default class SessionResultsComponent extends Vue {

  private fResultsTable?: Tabulator;

  mounted() {
    this.fResultsTable = new Tabulator(this.$refs.resultsTable as HTMLDivElement, {
      layout: 'fitColumns',
      columns: [
        { title: 'Run name' }
      ]
    });
  }

}
</script>

<style>

</style>