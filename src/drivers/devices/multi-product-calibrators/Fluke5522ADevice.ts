import { MultiProductCalibratorDevice } from './MultiProductCalibrator';

export class Fluke5522A extends MultiProductCalibratorDevice {

  constructor() {
    super({
      classes: ['multi-product-calibrator'],
      info: {
        manufacturer: 'Fluke',
        model: '5522A',
        nomenclature: 'Multi-Product Calibrator'
      },
      commands: {
      }
    });
  }

  public async turnOutputOn(): Promise<void> {
    if (!this.communicationInterface) throw new Error('Communication interface not set');
    await this.communicationInterface.writeString('OPER');
  }
  public async turnOutputOff(): Promise<void> {
    if (!this.communicationInterface) throw new Error('Communication interface not set');
    await this.communicationInterface.writeString('STBY');
  }
  public async setCurrentAC(amps: number, frequency: number): Promise<void> {
    if (!this.communicationInterface) throw new Error('Communication interface not set');
    await this.communicationInterface.writeString(`OUT ${amps} A, ${frequency} HZ`);
  }
  public async setCurrentDC(amps: number): Promise<void> {
    if (!this.communicationInterface) throw new Error('Communication interface not set');
    await this.communicationInterface.writeString(`OUT ${amps} A, 0 HZ`);
  }
  public async setVoltageAC(volts: number, frequency: number): Promise<void> {
    if (!this.communicationInterface) throw new Error('Communication interface not set');
    await this.communicationInterface.writeString(`OUT ${volts} V, ${frequency} HZ`);
  }
  public async setVoltageDC(volts: number): Promise<void> {
    if (!this.communicationInterface) throw new Error('Communication interface not set');
    await this.communicationInterface.writeString(`OUT ${volts} V, 0 HZ`);
  }
  public async setResistance(ohms: number): Promise<void> {
    if (!this.communicationInterface) throw new Error('Communication interface not set');
    await this.communicationInterface.writeString(`OUT ${ohms} OHM`);
  }
  public async setFrequency(volts: number, frequency: number): Promise<void> {
    if (!this.communicationInterface) throw new Error('Communication interface not set');
    await this.communicationInterface.writeString(`OUT ${volts} V, ${frequency} HZ`);
  }

}