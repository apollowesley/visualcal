<template>
  <v-container>
    You're here because the page you requested doesn't exist
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class NoRouteView extends Vue {

}
</script>

<style>

</style>