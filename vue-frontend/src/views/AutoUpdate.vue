<template>
  <v-container fluid class="grey" style="height: 100vh">
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <h1 v-if="!updateNotAvailable" class="text-center">{{ updateInfo ? 'An update for VisualCal is available' : 'Checking for updates' }}</h1>
            <h1 v-if="updateNotAvailable" class="text-center">No update is available</h1>
          </v-col>
        </v-row>
        <v-row v-if="updateInfo" class="text-center" no-gutters>
          <v-col>
            
          </v-col>
        </v-row>
        <v-row class="text-center" no-gutters>
          <v-col>
            <h3 v-if="progress">Downloading update</h3>
          </v-col>
        </v-row>
        <v-row
          v-if="progress"
          class="text-center"
          no-gutters>
          <v-col>
            <v-progress-linear
              :value="progress ? progress.percent : 75"
              height="45px"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { UpdateInfo, ProgressInfo } from 'visualcal-common/types/auto-update';
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class AutoUpdateView extends Vue {

  updateInfo: UpdateInfo | null = null;
  progress: ProgressInfo | null = null;
  updateError: Error | null = null;
  startedCheckingForUpdates = false;
  updateNotAvailable = false;

  async mounted() {
    window.ipc.on('error', (error) => this.updateError = error);
    window.ipc.once('checkingForUpdatesStarted', () => this.startedCheckingForUpdates = true);
    window.ipc.once('updateAvailable', (info) => {
      this.updateInfo = info;
      window.ipc.on('downloadProgressChanged', (progress) => this.updateProgress(progress));
    });
    window.ipc.once('updateNotAvailable', () => this.updateNotAvailable = true);
    window.ipc.once('updateDownloaded', () => window.ipc.removeAllListeners('downloadProgressChanged'));
    window.ipc.listenForAutoUpdateEvents();
  }

  private updateProgress(progress: ProgressInfo) {
    this.progress = progress;
  }

  beforeDestroy() {
   window.ipc.removeAutoUpdateEventListeners();
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
