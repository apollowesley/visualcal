<template>
  <v-container
    fluid
  >
    <v-row
      no-gutters
    >
      <v-col>
        <div
          ref="driversTable"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Tabulator from 'tabulator-tables';

@Component
export default class SessionCommunicationComponent extends Vue {

  private fDriversTable?: Tabulator;

  mounted() {
    this.fDriversTable = new Tabulator(this.$refs.driversTable as HTMLDivElement, {
      layout: 'fitColumns',
      columns: [
        { title: 'Instrument Name' },
        { title: 'Instrument Driver' },
        { title: 'Interface Name' },
        { title: 'GPIB Address (if required)' },
      ]
    });
  }

}
</script>

<style>

</style>
