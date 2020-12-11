<template>
  <v-dialog
    :value="value"
    max-width="400"
    persistent
  >
    <v-card>
      <v-card-title class="headline grey lighten-2">
        Removing {{ type }} - {{ itemName }}
      </v-card-title>
      <div style="margin: 10px">Are you sure?</div>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          @click="close(true)"
        >
          Yes
        </v-btn>
        <v-btn
          @click="close(false)"
        >
          No
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class RemoveDialog extends Vue {

  @Prop({ type: Boolean, required: true }) value!: boolean;
  @Prop({ type: String, required: true }) text!: string;
  @Prop({ type: String, required: true }) itemName!: string;
  @Prop({ type: String, required: true }) type!: string;

  close(remove = false) {
    if (remove) this.$emit('remove', this.itemName);
    this.$emit('input', false);
  }

}
</script>

<style>

</style>
