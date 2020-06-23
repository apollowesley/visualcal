import { ControllableDevice } from '../ControllableDevice';
import { DeviceDefinition } from '../device-interfaces';

export type DigitalMultimeterDeviceDefinition = DeviceDefinition

export type DigitalMultimeterMode = 'aac' | 'adc' | 'vac' | 'vdc' | 'ohms' | 'ohms4' | 'freq' | 'diode' | 'cont' | 'per';
export type DigitalMultimeterRate = 'slow' | 'medium' | 'fast';
export type DigitalMultimeterRange = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Configuration {
  mode: DigitalMultimeterMode;
  range: number;
  rate: number;
}

export interface MeasurementConfiguration {
  mode: DigitalMultimeterMode;
  range?: number;
  rate?: number;
  relative?: boolean;
}

export interface SetModeOptions {
  fourWire?: boolean;
}

export abstract class DigitalMultimeterDevice extends ControllableDevice {

  constructor(definition: DeviceDefinition) {
    super(definition);
  }

  protected get digitalMultimeterDefinition(): DigitalMultimeterDeviceDefinition { return (this.deviceDefinition as DigitalMultimeterDeviceDefinition); }

  abstract async getConfiguration(): Promise<Configuration>;

  abstract async setByExpectedInput(expectedInput: number | bigint, mode: DigitalMultimeterMode, samplesPerSecond: number): Promise<void>;

  abstract async getMeasurement(config: MeasurementConfiguration): Promise<number>;

}
