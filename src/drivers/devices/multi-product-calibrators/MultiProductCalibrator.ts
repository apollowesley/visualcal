import { ControllableDevice } from '../ControllableDevice';

interface MultiProductCalibrator extends ControllableDevice {
  turnOutputOn(): Promise<void>;
  turnOutputOff(): Promise<void>;
  setCurrentAC(current: number, frequency: number): Promise<void>;
  setCurrentDC(current: number): Promise<void>;
  setVoltageAC(volts: number, frequency: number): Promise<void>;
  setVoltageDC(volts: number): Promise<void>;
  setResistance(ohms: number): Promise<void>;
  setFrequency(volts: number, frequency: number): Promise<void>;
}

export abstract class MultiProductCalibratorDevice extends ControllableDevice implements MultiProductCalibrator {

  public abstract async turnOutputOn(): Promise<void>;
  public abstract async turnOutputOff(): Promise<void>;
  public abstract async setCurrentAC(amps: number, frequency: number): Promise<void>;
  public abstract async setCurrentDC(amps: number): Promise<void>;
  public abstract async setVoltageAC(volts: number, frequency: number): Promise<void>;
  public abstract async setVoltageDC(volts: number): Promise<void>;
  public abstract async setResistance(ohms: number): Promise<void>;
  public abstract async setFrequency(volts: number, frequency: number): Promise<void>;

}
