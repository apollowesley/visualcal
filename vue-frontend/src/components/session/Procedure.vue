<template>
  <v-container
    fluid
  >
    <v-row>
      <v-col>
        <v-select
          :items="items"
          v-model="selectedItem"
          label="Section"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class SessionProcedureComponent extends Vue {
  items: string[] = [];
  selectedItem = '';
}
</script>

<style>

</style>
