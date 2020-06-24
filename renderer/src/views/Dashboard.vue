<template>
  <v-container
    fluid
  >
    <v-snackbar
      v-model="fAlert"
      dismissible
      block
      dark
      top
      color="error"
      timeout="4000"
    >
      {{ fAlertMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="gray"
          v-bind="attrs"
          @click="fAlert = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-row>
      <v-col>
        <v-row
          align="stretch"
        >
          <v-col cols="3">
            <DashboardProceduresComponent
              @active="onProceduresComponentActive"
              @error="onProceduresComponentError"
            />
          </v-col>
          <v-col>
            <v-card
              class="card"
            >
              <v-card-title primary-title>
                Content
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import DashboardProceduresComponent from '../components/dashboard/Procedures.vue';

@Component({
  components: {
    DashboardProceduresComponent
  }
})
export default class Dashboard extends Vue {

  private fAlert: boolean = false;
  private fAlertMessage: string = '';

  onProceduresComponentActive(items: TreeItem[]) {
    if (!items || items.length <= 0) return;
    alert(items[0].name + ' ' + items[0].type);
  }

  onProceduresComponentError(err: Error) {
    this.fAlertMessage = err.message;
    this.fAlert = true;
  }

}
</script>

<style scoped>
.card {
  height: 90vh;
}
</style>