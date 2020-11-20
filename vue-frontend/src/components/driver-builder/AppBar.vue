<template>
  <v-app-bar
    dense
  >
    <v-app-bar-nav-icon @click.stop="shouldShow = !shouldShow"></v-app-bar-nav-icon>
    <v-spacer></v-spacer>
    <v-toolbar-title>Driver Builder</v-toolbar-title>
    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class AppBarComponent extends Vue {

  @Prop({ type: Boolean, required: true }) value!: boolean;

  get shouldShow() { return this.value; }
  set shouldShow(value: boolean) { this.$emit('input', value); }

}
</script>

<style>

</style>