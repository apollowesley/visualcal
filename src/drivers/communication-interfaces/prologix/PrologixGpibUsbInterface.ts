import { PrologixGpibInterface } from './PrologixGpibInterface';
import SerialPort from 'serialport';
import ReadlineParser from '@serialport/parser-readline';
import { TextDecoder, TextEncoder } from 'util';

export interface ConfigurationOptions extends CommunicationInterfaceConfigurationOptions {
  portName: string;
}

export class PrologixGpibUsbInterface extends PrologixGpibInterface {

  private fSerialPort?: SerialPort = undefined;
  private fClientOptions?: ConfigurationOptions = undefined;
  private fConnecting: boolean = false;

  configure(options: ConfigurationOptions) {
    super.configure(options);
    this.fClientOptions = options;
  }

  async connect(): Promise<void> {
    if (this.fConnecting) {
      this.fConnecting = false;
      this.disconnect();
      throw new Error('Already connecting');
    }
    return new Promise((resolve, reject) => {
      this.onConnecting();
      this.fConnecting = true;
      try {
        if (!this.fClientOptions) throw 'Not configured';
        this.fSerialPort = new SerialPort(this.fClientOptions.portName, { autoOpen: false });
        const parser = this.fSerialPort.pipe(new ReadlineParser({ delimiter: '\n' }));
        this.fSerialPort.on('close', () => this.disconnect());
        this.fSerialPort.on('end', () => this.disconnect());
        this.fSerialPort.on('error', (err) => this.onError(err));
        this.fSerialPort.on('timeout', () => this.disconnect());
        parser.on('data', (data: string) => this.onData(new TextEncoder().encode(data).buffer));
        this.fSerialPort.once('open', async () => {
          await super.onConnected();
          this.fConnecting = false;
          return resolve();
        });
        this.fSerialPort.open((err) => {
          if (err) throw err;
        });
      } catch (error) {
        this.disconnect();
        this.onError(error);
        reject(error);
      }
    });
  }
  
  disconnect(): void {
    this.fConnecting = false;
    if (this.fSerialPort) {
      this.fSerialPort.removeAllListeners();
      try {
        this.fSerialPort.close();
        this.fSerialPort.end();
        this.fSerialPort.destroy();
      } catch (error) {
        console.debug('Expected error: ' + error);
      } finally {
        this.fSerialPort = undefined;
      }
    }
    this.onDisconnected();
  }

  get isConnected(): boolean {
    if (!this.fSerialPort) return false;
    return !this.fConnecting && this.fSerialPort.isOpen && !this.fSerialPort.destroyed;
  }

  async setDeviceAddress(address: number): Promise<void> {
    console.debug(`Setting device GPIB address to ${address}`);
    const data: string[] = ['++auto 0', `++addr ${address}`, '++auto 1'];
    data.forEach(d => {
      if (!this.fSerialPort) {
        const errMsg = 'No connection';
        const err = new Error(errMsg);
        this.onError(err);
        throw err;
      }
      this.fSerialPort.write(`${d}\n`);
    });
    console.debug(`Device GPIB address set to ${address}`);
  }

  write(data: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.fSerialPort) {
          const errMsg = 'No connection';
          this.onError(new Error(errMsg));
          return reject(errMsg);
        }
        const view = new Uint8Array(data);
        const dataString = new TextDecoder('utf-8').decode(view);
        const result = this.fSerialPort.write(dataString);
        if (result) return resolve();
        else return reject('Error writing data to Prologix GPIB USB over socket');
      } catch (error) {
        this.onError(error);
        reject(error);
      }
    });
  }
  
}