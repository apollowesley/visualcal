<template>
  <v-card>
    <v-container>
      <v-row no-gutters>
        <v-col>
          <h2>Interfaces</h2>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
        <TabulatorComponent
          :columns="columns"
          layout="fitData"
          :show-row-hover="false"
          :data="communicationInterfaces"
        />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { BenchConfig, CommunicationInterfaceConfigurationInfo } from 'visualcal-common/src/bench-configuration';
import { Vue, Component, Prop } from 'vue-property-decorator';
import TabulatorComponent from '@/components/Tabulator.vue';
import Tabulator from 'tabulator-tables';

@Component({
  components: {
    TabulatorComponent
  }
})
export default class BenchConfigComponent extends Vue {

  fDeleteInterfaceButtons: HTMLButtonElement[] = [];

  @Prop({ type: Array, required: false }) serialPorts?: string[];
  @Prop({ type: Object, required: false }) benchConfig?: BenchConfig;
  
  get communicationInterfaces() { return this.benchConfig ? this.benchConfig.interfaces : [] }

  get name() { return this.benchConfig ? this.benchConfig.name : ''; }

  private setSelectSessionButtonsDisabled(disabled: boolean) {
    for (const button of this.fDeleteInterfaceButtons) {
      button.disabled = disabled;
    }
  }

  private onSelectSessionButtonClicked(interfaceName: string) {
    this.setSelectSessionButtonsDisabled(true);
    this.$emit('delete-interface', interfaceName);
    this.setSelectSessionButtonsDisabled(false);
  }

  private createDeleteInterfaceColumnButton(cell: Tabulator.CellComponent) {
    const button = document.createElement('button') as HTMLButtonElement;
    button.textContent = 'Delete';
    button.style.backgroundColor = '#b5b5b5';
    button.style.marginLeft = '7px';
    button.style.marginRight = '7px';
    button.style.padding = '7px';
    button.style.width = '90%';
    button.style.boxShadow = '2px 2px #888888';
    button.id = (cell.getRow().getData() as CommunicationInterfaceConfigurationInfo).name;
    button.onclick = () => this.onSelectSessionButtonClicked(button.id);
    this.fDeleteInterfaceButtons.push(button);
    return button;
  }

  private createUnusedCell() {
    const div = document.createElement('div') as HTMLDivElement;
    div.style.backgroundColor = '#b5b5b5';
    div.style.height = '100%';
    div.style.width = '100%';
    return div;
  }

  private getSerialPortEditorParams() {
    if (!this.serialPorts) return [];
    return this.serialPorts.map(s => {
      return {
        label: s,
        value: s
      };
    });
  }

  columns: Tabulator.ColumnDefinition[] = [
    { title: 'Name', field: 'name', editable: true, editor: 'input' },
    { title: 'Type', field: 'type' },
    { title: 'GPIB Address', field: 'nationalInstrumentsGpib.address', formatter: (cell) => cell.getValue() !== undefined ? cell.getValue() : this.createUnusedCell(), editable: (cell) => cell.getValue() !== undefined, editor: 'number' },
    { title: 'TCP', columns: [
      { title: 'Host', field: 'tcp.host', formatter: (cell) => cell.getValue() !== undefined ? cell.getValue() : this.createUnusedCell(), editable: (cell) => cell.getValue() !== undefined, editor: 'input' },
      { title: 'Port', field: 'tcp.port', formatter: (cell) => cell.getValue() !== undefined ? cell.getValue() : this.createUnusedCell(), editable: (cell) => cell.getValue() !== undefined && cell.getRow().getCell('type').getValue() !== 'Prologix GPIB TCP', editor: 'number' }
    ]},
      { title: 'Serial', columns: [
      { title: 'Port Name (Path)', field: 'serial.port', formatter: (cell) => cell.getValue() !== undefined ? cell.getValue() : this.createUnusedCell(), editable: (cell) => cell.getValue() !== undefined, editor: 'select', editorParams: () => this.getSerialPortEditorParams() },
      { title: 'Baud Rate', field: 'serial.baudRate', formatter: (cell) => cell.getValue() !== undefined ? cell.getValue() : this.createUnusedCell() },
      { title: 'Parity', field: 'serial.parity', formatter: (cell) => cell.getValue() !== undefined ? cell.getValue() : this.createUnusedCell() },
      { title: 'Stop Bits', field: 'serial.stopBits', formatter: (cell) => cell.getValue() !== undefined ? cell.getValue() : this.createUnusedCell() },
      { title: 'Data Bits', field: 'serial.dataBits', formatter: (cell) => cell.getValue() !== undefined ? cell.getValue() : this.createUnusedCell() }
    ] },
    { title: '', formatter: this.createDeleteInterfaceColumnButton }
  ];

}
</script>

<style>

</style>
