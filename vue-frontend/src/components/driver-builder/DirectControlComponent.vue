<template>
  <v-row class="ma-5">
      <v-col
        cols="6"
      >
        <v-select
          v-model="selectedInterfaceInfo"
          :items="communicationInterfaceInfos"
          label="Communication Interface"
          item-text="name"
          return-object
        />
      </v-col>
      <v-col
        v-if="selectedInterfaceInfo && selectedInterfaceInfo.type.toLocaleUpperCase().includes('GPIB')"
        cols="2"
      >
        <v-text-field
          v-model="deviceGpibAddress"
          :rules="[deviceGpibAddressRangeRule]"
          :disabled="connecting"
          label="Device GPIB Address"
          type="number"
          min="1"
          max="31"
          @mousewheel="onDeviceGpibAddressMouseWheel"
        />
      </v-col>
      <v-col>
        <v-btn
          :disabled="!selectedInterfaceInfo"
          color="primary"
          @click="onConnectDisconnectButtonClicked"
        >
          {{ isCommunicationInterfaceConnected ? 'Disconnect' : 'Connect' }}
        </v-btn>
      </v-col>
  </v-row>
</template>

<script lang="ts">
import { VuetifyRule } from '@/utils/vuetify-input-rules';
import { MouseWheelInputEvent } from 'electron';
import { CommunicationInterfaceConfigurationInfo } from 'visualcal-common/src/bench-configuration';
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class DirectControlComponent extends Vue {

  connecting = false;

  deviceGpibAddressRangeRule: VuetifyRule = (v) => {
    if (!v) return 'Required';
    const address = parseInt(v);
    if (address >= 1 && address <= 31) return true;
    return 'Must be between 1 and 31';
  };

  get communicationInterfaceInfos() { return this.$store.direct.state.driverBuilder.communicationInterfaceInfos; }

  get selectedInterfaceInfo() { return this.$store.direct.state.driverBuilder.selectedCommunicationInterfaceInfo; }
  set selectedInterfaceInfo(value: CommunicationInterfaceConfigurationInfo | undefined) { this.$store.direct.commit.driverBuilder.setSelectedCommunicationInterfaceInfo(value); }

  get deviceGpibAddress() { return this.$store.direct.state.driverBuilder.deviceGpibAddress; }
  set deviceGpibAddress(value: number) { this.$store.direct.commit.driverBuilder.setDeviceGpibAddress(parseInt(value.toString())); }

  get isCommunicationInterfaceConnected() { return this.$store.direct.state.driverBuilder.isSelectedCommunicationInterfaceConnected; }

  onDeviceGpibAddressMouseWheel(event: MouseWheelInputEvent) {
    if (!event.wheelTicksY) return;
    const deltaY = event.wheelTicksY / 12;
    this.deviceGpibAddress -= deltaY;
  }

  async onConnectDisconnectButtonClicked() {
    this.connecting = true;
    try {
      if (this.isCommunicationInterfaceConnected) {
        await this.$store.direct.dispatch.driverBuilder.disconnect();
      } else {
        await this.$store.direct.dispatch.driverBuilder.connect();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      this.connecting = false;
    }
  }

}
</script>

<style>

</style>
