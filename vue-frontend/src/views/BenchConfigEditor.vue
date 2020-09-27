<template>
  <v-container fluid fill-height class="grey">
    <v-row>
      <v-col>
        <v-form>
          <v-row>
            <v-col>
              <h1 class="text-center">Select a bench configuration to edit</h1>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <v-select
                :items="benchConfigs"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
            </v-col>
          </v-row>
          <v-row class="text-center" no-gutters>
            <v-col>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { BenchConfig } from 'visualcal-common/dist/bench-configuration';

@Component
export default class BenchConfigView extends Vue {

  benchConfigs: BenchConfig[] = [];

}
</script>

<style>

</style>
