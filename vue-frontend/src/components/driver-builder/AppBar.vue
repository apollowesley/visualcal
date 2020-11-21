<template>
  <v-app-bar
    height="70px"
    dense
  >
    <v-app-bar-nav-icon @click.stop="shouldShow = !shouldShow"></v-app-bar-nav-icon>
    <v-spacer></v-spacer>
    <v-toolbar-title>Driver Builder</v-toolbar-title>
    <v-spacer></v-spacer>
    <DirectControlComponent class="mt-5" />
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import DirectControlComponent from "@/components/driver-builder/DirectControlComponent.vue";
import DirectControlTesterDialog from "@/components/driver-builder/DirectControlTesterDialog.vue";

@Component({
  components: {
    DirectControlComponent,
    DirectControlTesterDialog
  }
})
export default class AppBarComponent extends Vue {

  @Prop({ type: Boolean, required: true }) value!: boolean;

  get shouldShow() { return this.value; }
  set shouldShow(value: boolean) { this.$emit('input', value); }

}
</script>

<style>

</style>