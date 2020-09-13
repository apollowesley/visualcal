import { PrologixGpibInterface } from './PrologixGpibInterface';
import SerialPort from 'serialport';
import ReadlineParser from '@serialport/parser-readline';
import { TextDecoder, TextEncoder } from 'util';
import electronLog from 'electron-log';

const log = electronLog.scope('PrologixGpibUsbInterface');

interface ConfigurationOptions extends CommunicationInterfaceConfigurationOptions {
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
        this.fSerialPort = new SerialPort(this.fClientOptions.portName, { autoOpen: false, lock: true });
        const parser = this.fSerialPort.pipe(new ReadlineParser({ delimiter: '\n' }));
        const textEncoder = new TextEncoder();
        parser.on('data', (data: string) => this.onData(textEncoder.encode(data).buffer));
        this.fSerialPort.once('close', () => this.disconnect());
        this.fSerialPort.once('end', () => this.disconnect());
        this.fSerialPort.on('error', (err) => this.onError(err));
        this.fSerialPort.once('timeout', () => this.disconnect());
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
        return reject(error);
      }
    });
  }
  
  disconnect(): void {
    const wasConnected = this.isConnected;
    this.fConnecting = false;
    if (this.fSerialPort) {
      this.fSerialPort.removeAllListeners();
      try {
        this.fSerialPort.close();
        this.fSerialPort.end();
        this.fSerialPort.destroy();
      } catch (error) {
        log.debug('Expected error: ' + error);
      }
    }
    this.fSerialPort = undefined;
    if (wasConnected) this.onDisconnected();
  }

  get isConnected(): boolean {
    if (!this.fSerialPort) return false;
    return !this.fConnecting && this.fSerialPort.isOpen && !this.fSerialPort.destroyed;
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
        this.fSerialPort.write(dataString);
        this.fSerialPort.drain((err) => {
          if (!err) return resolve();
          else {
            let errorMsg = `Error writing data to Prologix GPIB USB over serial port: ${err.message}`;
            if (this.fClientOptions) errorMsg = `Error writing data to Prologix GPIB USB over serial port, ${this.fClientOptions.portName}: ${err.message}`;
            this.onError(new Error(errorMsg));
            return reject(errorMsg);
          }
        });
      } catch (error) {
        this.onError(error);
        return reject(error);
      }
    });
  }
  
}