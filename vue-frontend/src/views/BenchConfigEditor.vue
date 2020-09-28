<template>
  <v-container fluid class="grey" style="height: 100vh">
    <ConfirmDeleteDialogComponent
      :should-show="confirmDeleteDialogShouldShow"
      :configuration-name="selectedBenchConfig ? selectedBenchConfig.name : ''"
      @confirm="deleteSelectedBenchConfiguration"
      @cancel="confirmDeleteDialogShouldShow = false"
    />
    <v-row>
      <v-col>
        <v-container>
          <v-row>
            <v-col>
              <h1 class="text-center">Select a bench configuration to edit</h1>
            </v-col>
          </v-row>
          <v-row
            v-if="currentUser"
          >
            <v-col>
              <v-btn
                @click="addNewBenchConfiguration"
              >
                Add new bench configruration
              </v-btn>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <v-select
                v-model="selectedBenchConfig"
                :items="benchConfigs"
                label="Bench configuration"
                item-text="name"
                return-object
              />
            </v-col>
            <v-col
              v-if="selectedBenchConfig"
            >
              <v-btn
                @click="confirmDeleteSelectedConfiguration"
              >
                Delete Configuration
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-if="selectedBenchConfig" class="text-center" no-gutters>
            <v-col>
              <v-text-field
                v-model="selectedBenchConfig.name"
                label="Selected bench configuration name"
              />
            </v-col>
          </v-row>
          <v-row v-if="selectedBenchConfig" class="text-center" no-gutters>
            <v-col>
              <v-select
                v-model="selectedInterfaceTypeToAdd"
                :items="interfaceTypes"
                label="Interface type to add"
              />
            </v-col>
            <v-btn
              @click="addInterface"
            >
              Add Interface
            </v-btn>
          </v-row>
          <v-row v-if="selectedBenchConfig" no-gutters>
            <v-col>
              <BenchConfigComponent
                :bench-config="selectedBenchConfig"
                :serial-ports="serialPorts"
                @delete-interface="deleteInterface"
              />
            </v-col>
          </v-row>
          <v-row class="text-center">
            <v-col>
              <v-btn
                :disabled="!canSave.value"
                style="margin-right: 20px"
                width="100px"
                color="primary"
                @click="save"
              >
                Save
              </v-btn>
              <v-btn
                width="100px"
                @click="cancel"
              >
                Cancel
              </v-btn>
            </v-col>
          </v-row>
          <v-row
            v-if="canSave.reason"
            class="text-center"
          >
            <v-col>
              <h4 class="red">{{ canSave.reason }}</h4>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { User } from '@/types/session';
import { BenchConfig } from 'visualcal-common/src/bench-configuration';
import { CommunicationInterfaceTypes } from 'visualcal-common/dist/bench-configuration';
import BenchConfigComponent from '@/components/bench-config/Index.vue';
import ConfirmDeleteDialogComponent from '@/components/bench-config/ConfirmDeleteDialog.vue';

interface CanSaveResult {
  value: boolean;
  reason?: string;
}

@Component({
  components: {
    BenchConfigComponent,
    ConfirmDeleteDialogComponent
  }
})
export default class BenchConfigView extends Vue {

  confirmDeleteDialogShouldShow = false;
  serialPorts: string[] = [];
  currentUser: User | null = null;
  selectedBenchConfig: BenchConfig | null = null;
  interfaceTypes: string[] = [];
  selectedInterfaceTypeToAdd = '';

  get benchConfigs() {
    if (!this.currentUser) return [];
    return this.currentUser.benchConfigs;
  }

  private hasDuplicates<TObj, TArray extends Array<TObj>>(array: TArray) {
      return (new Set<TObj>(array)).size !== array.length;
  }

  get canSave() {
    let retVal: CanSaveResult = { value: true };
    if (this.hasDuplicates(this.benchConfigs.map(b => b.name))) {
      retVal = {
        value: false,
        reason: 'Duplicate bench configuration names'
      };
      return retVal;
    }
    this.benchConfigs.forEach(config => {
      if (this.hasDuplicates(config.interfaces.map(i => i.name))) {
        retVal = { value: false, reason: 'Duplicate interface names' };
        return retVal;
      }
    });
    return retVal;
  }

  async mounted() {
    const ports = await window.ipc.getSerialPorts();
    this.serialPorts = ports.map(s => s.path);
    CommunicationInterfaceTypes.forEach(i => this.interfaceTypes.push(i));
    this.interfaceTypes.sort();
    this.selectedInterfaceTypeToAdd = this.interfaceTypes[0];
    this.currentUser = await window.ipc.getCurrentUser();
    if (!this.currentUser || this.currentUser.benchConfigs.length <= 0) return;
    this.sortBenchConfigs();
    this.selectedBenchConfig = this.currentUser.benchConfigs[0];
  }

  private sortBenchConfigs() {
    if (!this.currentUser) return;
    this.currentUser.benchConfigs.sort((a, b) => {
      if (a.name > b.name) return +1;
      if (a.name < b.name) return -1;
      return 0;
    });
  }

  private addNewBenchConfiguration() {
    if (!this.currentUser) return;
    const newConfig = {
      name: 'New config',
      username: this.currentUser.email,
      interfaces: []
    };
    this.benchConfigs.push(newConfig);
    this.sortBenchConfigs();
    this.selectedBenchConfig = newConfig;
  }

  private addInterface() {
    if (!this.selectedBenchConfig) return;
    switch (this.selectedInterfaceTypeToAdd) {
      case 'Emulated':
        this.selectedBenchConfig.interfaces.push({ type: 'Emulated', name: 'Emulated' });
        break;
      case 'National Instruments GPIB':
        this.selectedBenchConfig.interfaces.push({ type: 'National Instruments GPIB', name: 'National Instruments GPIB', nationalInstrumentsGpib: { address: 0 } });
        break;
      case 'Prologix GPIB TCP':
        this.selectedBenchConfig.interfaces.push({ type: 'Prologix GPIB TCP', name: 'Prologix GPIB TCP', tcp: { host: 'hostname', port: 1234 } });
        break;
      case 'Prologix GPIB USB':
        this.selectedBenchConfig.interfaces.push({ type: 'Prologix GPIB USB', name: 'Prologix GPIB USB', serial: { port: '', baudRate: 9600 } });
        break;
      case 'Serial Port':
        this.selectedBenchConfig.interfaces.push({ type: 'Serial Port', name: 'Serial Port', serial: { port: '', baudRate: 9600 } });
        break;
    }
  }

  private deleteInterface(interfaceName: string) {
    if (!this.selectedBenchConfig) return;
    const interfaceIndex = this.selectedBenchConfig.interfaces.findIndex(i => i.name === interfaceName);
    this.selectedBenchConfig.interfaces.splice(interfaceIndex, 1);
  }

  private confirmDeleteSelectedConfiguration() {
    this.confirmDeleteDialogShouldShow = true;
  }

  private deleteSelectedBenchConfiguration() {
    this.confirmDeleteDialogShouldShow = false;
    if (!this.selectedBenchConfig) return;
    const configIndex = this.benchConfigs.findIndex(b => this.selectedBenchConfig && b.name === this.selectedBenchConfig.name);
    this.benchConfigs.splice(configIndex, 1);
    this.selectedBenchConfig = this.benchConfigs.length > 0 ? this.benchConfigs[0] : null;
  }

  private async save() {
    await window.ipc.saveBenchConfigurationsForCurrentUser(this.benchConfigs);
    close();
  }

  private cancel() {
    close();
  }

}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
