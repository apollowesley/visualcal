<template>
  <v-container fill-height class="grey">
    <v-row>
      <v-col
        class="text-center"
      >
        <h2>Loading required services.  This could take 10-20 seconds.</h2>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class ProcedureLoadingServicesView extends Vue {
}
</script>

<style>

</style>
