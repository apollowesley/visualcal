<template>
  <v-dialog
    :value="shouldShow"
    max-width="35%"
  >
    <v-container fluid class="grey text-center">
      <v-row>
        <v-col class="text-center">
          <h4>Testing Instruction Set - {{ instructionSetName }}</h4>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          offset="5"
        >
          <v-btn color="primary" class="ma-2" type="submit">
            Rename
          </v-btn>
          <v-btn class="ma-2" @click="$emit('cancel')">
            Close
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-dialog>
</template>

<script lang="ts">
import { InstructionSet } from '@/driver-builder';
import {Vue, Component, Prop} from 'vue-property-decorator';

@Component
export default class DirectControlTesterDialog extends Vue {

  @Prop({ type: Boolean, required: true }) shouldShow!: boolean; // Toggle show dialog
  @Prop({ type: Object, required: true }) instructionSet!: InstructionSet;

  get instructionSetName() { return this.instructionSet ? this.instructionSet.name : ''; }

}
</script>

<style>

</style>