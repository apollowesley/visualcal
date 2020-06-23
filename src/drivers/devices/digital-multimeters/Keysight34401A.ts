import { DigitalMultimeterDevice, DigitalMultimeterMode, SetModeOptions, MeasurementConfiguration, Configuration } from './DigitalMultimeter';
import { Identifiable, DeviceIdentity } from '../../IIdentifiable';

// Volt ranges (volts)
const VoltsACRangeCommands: string[] = ['AUTO ON', '0.1', '1', '10', '100', '750' ];
const VoltsDCRangeCommands: string[] = ['AUTO ON', '0.1', '1', '10', '100', '1000' ];

// Current ranges (amps)
const CurrentACRangeCommands: string[] = ['AUTO ON', '0.1', '1', '3' ];
const CurrentDCRangeCommands: string[] = ['AUTO ON', '0.01', '0.1', '1', '3' ];

// Resistance Ranges (ohms)
const OhmsRangeCommands: string[] = ['AUTO ON', '100', '1000', '10000', '100000', '1000000', '100000000' ]; // 2-wire and 4-wire

// Frequency/Period (Hz or s)
const FreqRangeCommands: string[] = ['AUTO ON', '3', '300000' ]; // Frequency in Hz
const PeriodRangeCommands: string[] = ['AUTO ON', '0.33', '0.0000033' ]; // Period in seconds

export class Keysight34401A extends DigitalMultimeterDevice implements Identifiable {

  constructor() {
    super({
      classes: ['digital-multi-meter'],
      info: {
        manufacturer: 'Keysight',
        model: '34401A',
        nomenclature: 'Digital Multimeter'
      },
      commands: {

      }
    });
  }

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
    const deviceConfig = (await this.communicationInterface.queryString('CONF?')).split(',');
    const deviceMode = deviceConfig[0];
    const deviceRange = deviceConfig[1];
    switch (deviceMode) {
      case 'VOLT':
        config.mode = 'vdc';
        config.range = VoltsDCRangeCommands.indexOf(deviceRange);
      case 'VOLT:AC':
        config.mode = 'vac';
        config.range = VoltsACRangeCommands.indexOf(deviceRange);
      case 'FREQ' :
        config.mode = 'freq';
        config.range = FreqRangeCommands.indexOf(deviceRange);
      case 'CURR':
        config.mode = 'adc';
        config.range = CurrentDCRangeCommands.indexOf(deviceRange);
      case 'CURR:AC':
        config.mode = 'aac';
        config.range = CurrentACRangeCommands.indexOf(deviceRange);
      case 'DIOD':
        config.mode = 'diode';
        config.range = 0;
      case 'FRES':
        config.mode = 'ohms4';
        config.range = OhmsRangeCommands.indexOf(deviceRange);
      case 'RES':
        config.mode = 'ohms';
        config.range = OhmsRangeCommands.indexOf(deviceRange);
      case 'PER':
        config.mode = 'per';
        config.range = PeriodRangeCommands.indexOf(deviceRange);
      case 'CONT':
        config.mode = 'cont';
        config.range = 0;
    }
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
        command += 'MEAS:CURR:AC?';
        if (config.range) command += ' ' + CurrentACRangeCommands[config.range];
        break;
      case 'adc':
        command += 'MEAS:CURR:DC?';
        if (config.range) command += ' ' + CurrentDCRangeCommands[config.range];
        break;
      case 'diode':
        command += 'MEAS:DIOD?';
        break;
      case 'freq':
        command += 'MEAS:FREQ?';
        if (config.range) command += ' ' + FreqRangeCommands[config.range];
        break;
      case 'ohms':
        command += 'MEAS:RES?';
        if (config.range) command += ' ' + OhmsRangeCommands[config.range];
        break;
      case 'ohms4':
        command += 'MEAS:FRES?';
        if (config.range) command += ' ' + OhmsRangeCommands[config.range];
        break;
      case 'vac':
        command += 'MEAS:VOLT:AC?';
        if (config.range) command += ' ' + VoltsACRangeCommands[config.range];
        break;
      case 'vdc':
        command += 'MEAS:VOLT:DC?';
        if (config.range) command += ' ' + VoltsDCRangeCommands[config.range];
        break;
    }
    if (config.relative) {
      await this.communicationInterface.writeString('CALC:FUNC:NULL');
      await delay(1000);
    }
    const value = await this.communicationInterface.queryString(command);
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
