<template>
  <v-container
    fluid
    class="pt-0 pb-0"
  >
    <v-row>
      <v-col
        cols="5"
      >
        <v-select
          :items="items"
          v-model="selectedItem"
          label="Section"
        />
      </v-col>
      <v-col
        cols="5"
      >
        <v-select
          :items="items"
          v-model="selectedItem"
          label="Action"
        />
      </v-col>
      <v-col>
        <v-btn
          label="Action"
        >
          Start
        </v-btn>
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
