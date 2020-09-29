<template>
  <v-container fluid fill-height class="grey">
    <v-row>
      <v-col>
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TabulatorComponent from '@/components/Tabulator.vue';
import Tabulator from 'tabulator-tables';

interface LogicResult {
  rawValue: string;
  value: number;
}

@Component({
  components: {
    TabulatorComponent
  }
})
export default class ResultsView extends Vue {

  columns: Tabulator.ColumnDefinition[] = [
    { title: 'Name', field: 'name', editable: true, editor: 'input' },
    { title: 'Type', field: 'type' }
  ];

  results: LogicResult[] = [];

}
</script>

<style>

</style>
