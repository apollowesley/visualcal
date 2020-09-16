<template>
  <v-app>
    <v-app-bar
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

      <v-switch
        v-model="darkMode"
        label="Dark mode"
      />
    </v-app-bar>

    <v-main>
      <v-container
        fluid
      >
        <v-row
          align="start"
          justify="center"
          no-gutters
        >
          <v-col>
            <v-content
              class="pt-0"
            >
              <router-view />
            </v-content>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import "tabulator-tables/dist/css/tabulator.min.css"; //import Tabulator stylesheet

@Component
export default class App extends Vue {

  get darkMode() { return this.$store.direct.getters.darkMode; }
  set darkMode(value: boolean) { this.$store.direct.commit.setDarkMode(value); }

}
</script>

<style sass>
  .v-card.theme--light {
    background-color: #ebebeb
  }
</style>
