<template>
  <v-row>
      <v-col
        cols="8"
      >
        <v-select
          v-model="selectedInterfaceInfo"
          :items="communicationInterfaceInfos"
          label="Communication Interface"
          item-text="name"
          return-object
          dense
        />
      </v-col>
      <v-col
        v-if="isSelectedInterfaceGpib"
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
          dense
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
import { Vue, Component, Watch } from 'vue-property-decorator';

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

  get isSelectedInterfaceGpib() { return this.$store.direct.getters.driverBuilder.isSelectedInterfaceGpib; }

  @Watch('deviceGpibAddress')
  onDeviceGpibAddressChanged() {
    localStorage.setItem('directControlDeviceGpibAddress', this.deviceGpibAddress.toString());
  }

  mounted() {
    const gpibAddress = localStorage.getItem('directControlDeviceGpibAddress');
    if (gpibAddress === null) return;
    this.deviceGpibAddress = Number(gpibAddress);
  }

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
