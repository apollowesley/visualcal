<template>
  <v-row
    no-gutters
  >
    <v-col>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title primary-title>
              Communication
            </v-card-title>
            <SessionProcedureComponent />
          </v-card>
        </v-col>
        <v-col>
          <v-card>
            <v-card-title primary-title>
              Procedure
            </v-card-title>
            <SessionProcedureComponent />
          </v-card>
        </v-col>
        <v-col>
          <v-card>
            <v-card-title primary-title>
              Status
            </v-card-title>
            <SessionProcedureComponent />
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
          <Results />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import SessionProcedureComponent from '@/components/session/Procedure.vue';
import Results from '@/components/session/Results.vue';

@Component({
  components: {
    SessionProcedureComponent,
    Results
  }
})
export default class SessionView extends Vue {

}
</script>

<style>

</style>
