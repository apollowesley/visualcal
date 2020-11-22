import { TypedEmitter } from 'tiny-typed-emitter';
import { BenchConfig } from 'visualcal-common/dist/bench-configuration';

interface ConstructorOptions {
  configsSelectElementId: string;
}

interface Events {
  selectedBenchConfigChanged: (config?: BenchConfig) => void;
}

export class DeviceConfigHandler extends TypedEmitter<Events> {

  private fSelectElement: HTMLSelectElement;

  constructor(opts: ConstructorOptions) {
    super();
    this.fSelectElement = document.createElement('select');
    ({
      elementId: opts.configsSelectElementId
    });
    this.fSelectElement.addEventListener('change', () => {
      const selectedValue = this.selectedValue;
      this.emit('selectedBenchConfigChanged', selectedValue);
    });
  }

  get deviceConfigElement() { return this.fSelectElement; }

  get selectedValue() {
    const selectedOption = this.fSelectElement.selectedOptions[0];
    if (!selectedOption) return undefined;
    const selectedValue = JSON.parse(selectedOption.value) as BenchConfig;
    return selectedValue;
  }

  setSelectedValue(value: BenchConfig) {
    for (let index = 0; index < this.fSelectElement.options.length; index++) {
      const configName = this.fSelectElement.options[index].value;
      if (configName === value.name) {
        this.fSelectElement.selectedIndex = index;
        return;
      }
    }
  }

  updateConfigs(configs: BenchConfig[]) {
    const deviceConfigSelectElement = this.deviceConfigElement;
    deviceConfigSelectElement.options.length = 0;
    configs.forEach(config => {
      const configEl = document.createElement('option');
      configEl.label = config.name;
      configEl.value = config.name;
    });
  }

}
