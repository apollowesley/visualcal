<template>
  <v-dialog
    :value="shouldShow"
    max-width="35%"
  >
    <v-container fluid class="grey text-center">
      <v-form @submit.prevent="onRenameClicked">
        <v-row>
          <v-col class="text-center">
            <h4>Rename Instruction Set - {{ instructionSetName }}</h4>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="newName"
              label="New name"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            offset="5"
          >
            <v-btn :disabled="newName.length <= 0" color="primary" class="ma-2" type="submit" @click="onRenameClicked">
              Rename
            </v-btn>
            <v-btn class="ma-2" @click="$emit('cancel')">
              Cancel
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </v-dialog>
</template>

<script lang="ts">
import { InstructionSet } from '@/driver-builder';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class RenameInstructionSetDialogComponent extends Vue {

  @Prop({ type: Boolean, required: true }) shouldShow!: boolean; // Toggle show dialog
  @Prop({ type: Object, required: true }) instructionSet!: InstructionSet;

  newName = '';

  get instructionSetName() { return this.instructionSet ? this.instructionSet.name : ''; }

  @Watch('instructionSet')
  private onInstructionSetChanged() {
    if (!this.instructionSet) return;
    this.newName = this.instructionSet.name;
  }

  onRenameClicked() {
    this.$emit('renamed', { originalInstructionSet: this.instructionSet, newName: this.newName });
  }

}
</script>

<style>

</style>