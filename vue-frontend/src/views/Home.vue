<template>
  <v-row
    align="start"
    no-gutters
  >
    <v-col>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title primary-title>
              Communication
            </v-card-title>
            <SessionCommunicationComponent />
          </v-card>
        </v-col>
        <v-col>
          <v-card>
            <v-card-title primary-title>
              Troubleshooting
            </v-card-title>
            <SessionProcedureComponent />
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title primary-title>
              Procedure
            </v-card-title>
            <SessionProcedureComponent />
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title primary-title>
              Results
            </v-card-title>
            <SessionResultsComponent />
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import SessionCommunicationComponent from '@/components/session/Communication.vue';
import SessionProcedureComponent from '@/components/session/Procedure.vue';
import SessionResultsComponent from '@/components/session/Results.vue';

@Component({
  components: {
    SessionCommunicationComponent,
    SessionProcedureComponent,
    SessionResultsComponent
  }
})
export default class SessionView extends Vue {

  async mounted() {
    const info = await window.ipc.getSessionViewInfo();
    console.info(info);
  }

}
</script>

<style>

</style>
