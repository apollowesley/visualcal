<template>
  <v-container fluid class="grey" style="height: 100vh">
    <v-row
      class="ma-10"
    >
      <v-col
        class="text-center"
      >
        <v-row>
          <v-col>
            <h2>Driver Builder</h2>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class DriverBuilderView extends Vue {

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
