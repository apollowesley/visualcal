import { PrologixGpibInterface } from './PrologixGpibInterface';
import SerialPort from 'serialport';
import ReadlineParser from '@serialport/parser-readline';
import { TextDecoder, TextEncoder } from 'util';
import electronLog from 'electron-log';
import { writeFile } from 'fs';

const log = electronLog.scope('PrologixGpibUsbInterface');

interface ConfigurationOptions extends CommunicationInterfaceConfigurationOptions {
  portName: string;
}

export class PrologixGpibUsbInterface extends PrologixGpibInterface {

  private fSerialPort?: SerialPort = undefined;
  private fClientOptions?: ConfigurationOptions = undefined;

  configure(options: ConfigurationOptions) {
    super.configure(options);
    this.fClientOptions = options;
  }

  protected onConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.fClientOptions) throw 'Not configured';
        this.fSerialPort = new SerialPort(this.fClientOptions.portName, { autoOpen: false, lock: true });
        const parser = this.fSerialPort.pipe(new ReadlineParser({ delimiter: '\n' }));
        const textEncoder = new TextEncoder();
        parser.on('data', (data: string) => this.onData(textEncoder.encode(data).buffer));
        this.fSerialPort.once('close', async () => await this.disconnect());
        this.fSerialPort.once('end', async () => await this.disconnect());
        this.fSerialPort.on('error', (err) => this.onError(err));
        this.fSerialPort.once('timeout', async () => await this.disconnect());
        this.fSerialPort.once('open', () => {
          log.debug('Prologix GPIB USB connected');
          return resolve();
        });
        this.fSerialPort.open((err) => {
          if (!err) return resolve();
          this.onError(err);
          return reject(err);
        });
      } catch (error) {
        this.onError(error);
        return reject(error);
      }
    });
  }
  
  protected onDisconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.fSerialPort) {
        try {
          this.fSerialPort.removeAllListeners();
          this.fSerialPort.close();
          this.fSerialPort.end();
          this.fSerialPort.destroy();
        } catch (error) {
          log.debug('Expected possible error: ' + error);
        }
      }
      this.fSerialPort = undefined;
      return resolve();
    });
  }

  get isConnected(): boolean {
    if (!this.fSerialPort) return false;
    return !this.isConnecting && this.fSerialPort.isOpen && !this.fSerialPort.destroyed;
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
        this.fSerialPort.write(dataString, (writeError) => {
          if (writeError) return reject(writeError?.message);
          if (!this.fSerialPort) return reject('fSerialPort is undefined');
          this.fSerialPort.drain((drainError) => {
            if (!drainError) return resolve();
            else {
              let errorMsg = `Error writing data to Prologix GPIB USB over serial port: ${drainError.message}`;
              if (this.fClientOptions) errorMsg = `Error writing data to Prologix GPIB USB over serial port, ${this.fClientOptions.portName}: ${drainError.message}`;
              this.onError(new Error(errorMsg));
              return reject(errorMsg);
            }
          });
        });
      } catch (error) {
        this.onError(error);
        return reject(error);
      }
    });
  }
  
}