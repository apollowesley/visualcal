<template>
  <v-row justify="center">
    <v-dialog
      v-model="shouldShow"
      persistent
      max-width="500"
    >
      <v-card>
        <v-card-title class="headline">
          Delete bench configuration?
        </v-card-title>
        <v-card-text>Are you sure you want to delete bench configuration named {{ configurationName }}?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            @click="confirm"
          >
            Yes
          </v-btn>
          <v-btn
            color="green darken-1"
            @click="cancel"
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class ConfirmDeleteDialogComponent extends Vue {

  @Prop({ type: Boolean, required: true }) shouldShow!: boolean;
  @Prop({ type: String, required: true }) configurationName!: string;

  confirm() {
    this.$emit('confirm');
  }

  cancel() {
    this.$emit('cancel');
  }

}
</script>

<style>

</style>
