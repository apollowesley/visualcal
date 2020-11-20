<template>
  <v-navigation-drawer
    v-model="shouldShow"
    absolute
    bottom
    temporary
    width="25%"
  >
    <InstructionsAndTemplatesPanelComponent :items="localItems" />
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import InstructionsAndTemplatesPanelComponent from '@/components/driver-builder/InstructionsAndTemplatesPanel.vue';

@Component({
  components: {
    InstructionsAndTemplatesPanelComponent
  }
})
export default class InstructionsAndTemplates extends Vue {

  group = true;

  @Prop({ type: Boolean, required: true }) value!: boolean;
  @Prop({ type: Array, required: false }) items?: boolean;

  get shouldShow() { return this.value; }
  set shouldShow(value: boolean) { this.$emit('input', value); }

  get localItems() { return this.items ? this.items : []; }

}
</script>

<style>

</style>