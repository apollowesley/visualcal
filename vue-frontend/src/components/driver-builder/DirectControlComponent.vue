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
        cols="1"
      >
        <v-text-field
          v-model="deviceGpibAddress"
          :rules="[deviceGpibAddressRangeRule]"
          label="Device GPIB Address"
          type="number"
        />
      </v-col>
      <v-col>
        <v-btn :disabled="!selectedInterfaceInfo" color="primary">
          Connect
        </v-btn>
      </v-col>
  </v-row>
</template>

<script lang="ts">
import { VuetifyRule } from '@/utils/vuetify-input-rules';
import { CommunicationInterfaceConfigurationInfo } from 'visualcal-common/src/bench-configuration';
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class DirectControlComponent extends Vue {

  deviceGpibAddress = 1;
  deviceGpibAddressRangeRule: VuetifyRule = (v) => {
    if (!v) return 'Required';
    const address = parseInt(v);
    if (address >= 1 && address <= 31) return true;
    return 'Must be between 1 and 31';
  };

  get communicationInterfaceInfos() { return this.$store.direct.state.driverBuilder.communicationInterfaceInfos; }

  get selectedInterfaceInfo() { return this.$store.direct.state.driverBuilder.selectedCommunicationInterfaceInfo; }
  set selectedInterfaceInfo(value: CommunicationInterfaceConfigurationInfo | undefined) { this.$store.direct.commit.driverBuilder.setSelectedCommunicationInterfaceInfo(value); }

  async mounted() {
    await this.$store.direct.dispatch.driverBuilder.refreshCommunicationInterfaceInfos();
  }

}
</script>

<style>

</style>
