import { NumericMeasurement } from 'visualcal-common/dist/result';
import { Device } from '../Device';
import { DeviceDefinition } from '../device-interfaces';

type DigitalMultimeterDeviceDefinition = DeviceDefinition

export type DigitalMultimeterMode = 'aac' | 'adc' | 'vac' | 'vdc' | 'ohms' | 'ohms4' | 'freq' | 'diode' | 'cont' | 'per';
type DigitalMultimeterRate = 'slow' | 'medium' | 'fast';
type DigitalMultimeterRange = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

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
  rearTerminals?: boolean;
  acFilterHz?: number;
}

export interface SetModeOptions {
  fourWire?: boolean;
}

export abstract class DigitalMultimeterDevice extends Device {

  constructor(definition: DeviceDefinition) {
    super(definition);
  }

  get hasRearTerminals() { return false; }
  get hasACFilter() { return false; }

  protected get digitalMultimeterDefinition(): DigitalMultimeterDeviceDefinition { return (this.deviceDefinition as DigitalMultimeterDeviceDefinition); }

  abstract getConfiguration(): Promise<Configuration>;

  abstract setByExpectedInput(expectedInput: number | bigint, mode: DigitalMultimeterMode, samplesPerSecond: number): Promise<void>;

  abstract getMeasurement(config: MeasurementConfiguration): Promise<NumericMeasurement<string, number>>;

}
