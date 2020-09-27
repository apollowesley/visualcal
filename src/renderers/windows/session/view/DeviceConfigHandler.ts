import { TypedEmitter } from 'tiny-typed-emitter';
import { SelectHandler } from '../../../components/SelectHandler';
import { BenchConfig } from 'visualcal-common/dist/bench-configuration';

interface ConstructorOptions {
  configsSelectElementId: string;
}

interface Events {
  selectedBenchConfigChanged: (config?: BenchConfig) => void;
}

export class DeviceConfigHandler extends TypedEmitter<Events> {

  private fBenchConfigHandler: SelectHandler<BenchConfig>;

  constructor(opts: ConstructorOptions) {
    super();
    this.fBenchConfigHandler = new SelectHandler({
      elementId: opts.configsSelectElementId
    });
    this.fBenchConfigHandler.on('changed', (config) => this.onSelectedBenchConfigChanged(config));
  }

  get benchConfigHandler() { return this.fBenchConfigHandler; }

  private onSelectedBenchConfigChanged(config?: BenchConfig) {
    this.emit('selectedBenchConfigChanged', config);
  }

}
