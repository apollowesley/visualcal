<template>
  <v-app class="full-height no-scroll">
    <v-app-bar
      v-if="showAppBar"
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="IndySoft"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="@/assets/indysoft-logo.svg"
          width="100"
          style="margin-right: 5px"
        />
        <h3>VisualCal</h3>
      </div>

      <v-spacer></v-spacer>

      <h3
        v-if="procedureName"
      >
        Procedure: {{ procedureName }}
      </h3>

      <v-spacer></v-spacer>

      <v-switch
        v-model="darkMode"
        label="Dark mode"
      />
    </v-app-bar>

    <v-main>
      <h1 v-if="!isRunningInVisualCal" class="text-center red">Not running in VisualCal</h1>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import "tabulator-tables/dist/css/tabulator.min.css"; //import Tabulator stylesheet

@Component
export default class App extends Vue {

  get isRunningInVisualCal() { return window.electron !== undefined; }

  get darkMode() { return this.$store.direct.getters.darkMode; }
  set darkMode(value: boolean) { this.$store.direct.commit.setDarkMode(value); }

  get showAppBar() { return this.$route.name === 'Session'; }

  get procedureName() {
    if (!this.$store.direct.state.sessionViewInfo || !this.$store.direct.state.sessionViewInfo.procedure) return '';
    return this.$store.direct.state.sessionViewInfo.procedure.name;
  }

  mounted() {
    // (document.getElementsByTagName('html')[0].style.overflowY = 'hidden');
    if (this.isRunningInVisualCal) return;
    console.error('Not running in VisualCal');
    console.info(window.ipc);
  }

}
</script>

<style>

  .theme--dark.v-application {
    background-color: #2b2b2b !important;
  }

  .v-card.v-sheet.theme--light {
    background-color: #ebebeb;
    min-width: 250px;
  }

  .v-card.v-sheet.theme--dark {
    background-color: #525252;
    min-width: 250px;
  }

  .full-height {
    height: 100vh !important;
  }

  .no-scroll::-webkit-scrollbar {
    display: none !important;
  }

</style>
