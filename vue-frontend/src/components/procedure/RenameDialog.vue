<template>
  <v-dialog
    :value="value"
  >
    <v-card>
      <v-card-title class="headline grey lighten-2">
        Renaming Procedure - {{ oldName }}
      </v-card-title>
      <v-container>
        <v-row>
          <v-col>
            <v-text-field
              v-model="fNewName"
              :rules="fNewNameRules"
              aria-required
              label="New Procedure Name"
            />
          </v-col>
        </v-row>
      </v-container>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="onOkButtonClicked"
        >
          Rename
        </v-btn>
        <v-btn
          @click="onCancelButtonClicked"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { requiredRule, VuetifyRule } from '@/utils/vuetify-input-rules';

@Component
export default class RenameDialog extends Vue {

  @Prop({ type: Boolean, required: true }) value!: boolean;
  @Prop({ type: String, required: true }) oldName!: string;

  fNewNameRules: VuetifyRule[] = [requiredRule];
  fNewName = '';

  async onOkButtonClicked() {
    try {
      await window.ipc.renameProcedure(this.oldName, this.fNewName);
      this.$emit('renamed', this.fNewName);
      this.close();
    } catch (error) {
      alert(error.message);
    }
  }

  onCancelButtonClicked() {
    this.close();
  }

  close() {
    this.$emit('input', false);
  }

}
</script>

<style>

</style>
