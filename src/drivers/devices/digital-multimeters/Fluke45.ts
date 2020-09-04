import { DigitalMultimeterDevice, DigitalMultimeterMode, MeasurementConfiguration, Configuration } from './DigitalMultimeter';
import { Identifiable, DeviceIdentity } from '../../IIdentifiable';

export class Fluke45 extends DigitalMultimeterDevice implements Identifiable {

  constructor() {
    super({
      classes: ['digital-multi-meter'],
      info: {
        manufacturer: 'Fluke',
        model: '45',
        nomenclature: 'Digital Multimeter'
      },
      commands: {
      }
    });
  }

  get hasRearTerminals() { return true; }

  async getIdentity(): Promise<DeviceIdentity> {
    if (!this.communicationInterface) throw new Error('No communication interface');
    const ident = await this.communicationInterface.queryString('*IDN?');
    const identSplit = ident.split(',');
    return {
      manufacturer: identSplit[0],
      model: identSplit[1],
      serialNumber: identSplit[2],
      options: identSplit.length > 3 ? [ ...identSplit[3] ] : []
    };
  }

  async getConfiguration(): Promise<Configuration> {
    if (!this.communicationInterface) throw new Error('No communication interface');
    const config: Configuration = {
      mode: 'aac',
      rate: 0,
      range: 0
    };
    config.mode = (await this.communicationInterface.queryString('FUNC1?')) as DigitalMultimeterMode;
    const rate = (await this.communicationInterface.queryString('RATE?')).toLowerCase();
    switch (rate) {
      case 's':
        config.rate = 0;
      case 'm':
        config.rate = 1;
      case 'f':
        config.rate = 2;
    }
    const range = await this.communicationInterface.queryString('RANGE?');
    if (range.toLowerCase() === 'auto') config.range = 0;
    config.range = Number(range);
    return config;
  }

  async getMeasurement(config: MeasurementConfiguration): Promise<number> {
    if (!this.communicationInterface) throw new Error('No communication interface');
    function delay(duration: number) {
      return new Promise(function(resolve) { 
        return setTimeout(resolve, duration);
      });
    }
    let command = '';
    switch (config.mode) {
      case 'aac':
        command += 'AAC;';
        break;
      case 'adc':
        command += 'ADC;';
        break;
      case 'diode':
        command += 'DIODE;';
        break;
      case 'freq':
        command += 'FREQ;';
        break;
      case 'ohms':
        command += 'OHMS;';
        break;
      case 'ohms4':
        command += 'OHMS;';
        break;
      case 'vac':
        command += 'VAC;';
        break;
      case 'vdc':
        command += 'VDC;';
        break;
    }
    if (config.rate) {
      switch (config.rate) {
        case 0:
          command += 'RATE S;';
          break;
        case 1:
          command += 'RATE M;';
          break;
        case 2:
          command += 'RATE F;';
          break;
      }
    }
    await this.communicationInterface.writeString(command);
    if (config.relative) {
      await this.communicationInterface.writeString('REL');
      await delay(1000);
    }
    const value = await this.communicationInterface.queryString('MEAS?');
    return parseFloat(value);
  }
  
  async setByExpectedInput(expectedInput: number | bigint, mode: DigitalMultimeterMode, samplesPerSecond: number = 5): Promise<void> {
    if (!this.communicationInterface) throw new Error('No communication interface');
    let rateLetter = 'M';
    let cmd = 'RANGE ';
    if (!mode) throw 'Mode required';
    if (samplesPerSecond < 5) rateLetter = 'S';
    else if (20 <= samplesPerSecond) rateLetter = 'F';
    switch (mode) {
      case 'diode':
        // await this.setMode('diode');
        return;
      case 'aac':
        if (rateLetter === 'S') {
          if (-0.01 <= expectedInput && expectedInput <= 0.01) cmd += '1';
          else if (-0.1 <= expectedInput && expectedInput <= 0.1) cmd += '2';
          else if (-10 <= expectedInput && expectedInput <= 10) cmd += '3';
          else if (expectedInput < -10 || 10 < expectedInput) throw `${expectedInput} exceeds the range for mode ${mode}`;
        }
        else
        {
          if (-0.03 <= expectedInput && expectedInput <= 0.03) cmd += '1';
          else if (-0.1 <= expectedInput && expectedInput <= 0.1) cmd += '2';
          else if (-10 <= expectedInput && expectedInput <= 10) cmd += '3';
          else if (expectedInput < -10 || 10 < expectedInput) throw `${expectedInput} exceeds the range for mode ${mode}`;
        }
        break;
      case 'adc':
          if (rateLetter === 'S') {
            if (-0.01 <= expectedInput && expectedInput <= 0.01) cmd += '1';
            else if (-0.1 <= expectedInput && expectedInput <= 0.1) cmd += '2';
            else if (-10 <= expectedInput && expectedInput <= 10) cmd += '3';
            else if (expectedInput < -10 || 10 < expectedInput) throw `${expectedInput} exceeds the range for mode ${mode}`;
          }
          else
          {
            if (-0.03 <= expectedInput && expectedInput <= 0.03) cmd += '1';
            else if (-0.1 <= expectedInput && expectedInput <= 0.1) cmd += '2';
            else if (-10 <= expectedInput && expectedInput <= 10) cmd += '3';
            else if (expectedInput < -10 || 10 < expectedInput) throw `${expectedInput} exceeds the range for mode ${mode}`;
          }
        break;
      case 'vac':
        if(rateLetter === 'S') {
          if (-0.1 <= expectedInput && expectedInput <= 0.1) cmd += '1';
          else if (-1 <= expectedInput && expectedInput <= 1) cmd += '2';
          else if (-10 <= expectedInput && expectedInput <= 10) cmd += '3';
          else if (-100 <= expectedInput && expectedInput <= 100) cmd += '4';
          else if (-750 <= expectedInput && expectedInput <= 750) cmd += '5';
          else if (expectedInput < -750 || 750 < expectedInput) throw `${expectedInput} exceeds the range for mode ${mode}`;
        }
        else
        {
          if (-0.3 <= expectedInput && expectedInput <= 0.3) cmd += '1';
          else if (-3 <= expectedInput && expectedInput <= 3) cmd += '2';
          else if (-30 <= expectedInput && expectedInput <= 30) cmd += '3';
          else if (-300 <= expectedInput && expectedInput <= 300) cmd += '4';
          else if (-750 <= expectedInput && expectedInput <= 750) cmd += '5';
          else if (expectedInput < -750 || 750 < expectedInput) throw `${expectedInput} exceeds the range for mode ${mode}`;
        }
        break;
      case 'vdc':
        if (rateLetter === 'S') {
          if (-0.1 <= expectedInput && expectedInput <= 0.1) cmd += '1';
          else if (-1 <= expectedInput && expectedInput <= 1) cmd += '2';
          else if (-10 <= expectedInput && expectedInput <= 10) cmd += '3';
          else if (-100 <= expectedInput && expectedInput <= 100) cmd += '4';
          else if (-1000 <= expectedInput && expectedInput <= 1000) cmd += '5';
          else if (expectedInput < -1000 || 1000 < expectedInput) throw `${expectedInput} exceeds the range for mode ${mode}`;
        }
        else
        {
          if (-0.3 <= expectedInput && expectedInput <= 0.3) cmd += '1';
          else if (-3 <= expectedInput && expectedInput <= 3) cmd += '2';
          else if (-30 <= expectedInput && expectedInput <= 30) cmd += '3';
          else if (-300 <= expectedInput && expectedInput <= 300) cmd += '4';
          else if (-1000 <= expectedInput && expectedInput <= 1000) cmd += '5';
          else if (expectedInput < -1000 || 1000 < expectedInput) throw `${expectedInput} exceeds the range for mode ${mode}`;
        }
        break;
      case 'ohms':
        if (rateLetter === 'S') {
          if (expectedInput <= 100) cmd += '1';
          else if (expectedInput <= 1000) cmd += '2';
          else if (expectedInput <= 10000) cmd += '3';
          else if (expectedInput <= 100000) cmd += '4';
          else if (expectedInput <= 1000000) cmd += '5';
          else if (expectedInput <= 10000000) cmd += '6';
          else if (expectedInput <= 100000000) cmd += '7';
          else if (100000000 < expectedInput) throw `${expectedInput} exceeds the range for mode ${mode}`;
        }
        else
        {
          if (expectedInput <= 300) cmd += '1';
          else if (expectedInput <= 3000) cmd += '2';
          else if (expectedInput <= 30000) cmd += '3';
          else if (expectedInput <= 300000) cmd += '4';
          else if (expectedInput <= 3000000) cmd += '5';
          else if (expectedInput <= 30000000) cmd += '6';
          else if (expectedInput <= 300000000) cmd += '7';
          else if (300000000 < expectedInput) throw `${expectedInput} exceeds the range for mode ${mode}`;
        }
        break;
      case 'freq':
          if (expectedInput <= 1000) cmd += '1';
          else if (expectedInput <= 10000) cmd += '2';
          else if (expectedInput <= 100000) cmd += '3';
          else if (expectedInput <= 1000000) cmd += '4';
          else if (expectedInput <= 1000000) cmd += '5'; //TODO: range 4 and 5 show 1000kHz and 1MHz in the manual (the same number).
          else if (1000001 < expectedInput) throw `${expectedInput} exceeds the range for mode ${mode}`;
        break;
      default:
        throw 'Invalid mode';
    }
    // Add rate if we're not using the default, Medium
    if (rateLetter !== 'M') cmd += ';RATE ' + rateLetter;
    await this.communicationInterface.writeString(cmd);
  }

}
