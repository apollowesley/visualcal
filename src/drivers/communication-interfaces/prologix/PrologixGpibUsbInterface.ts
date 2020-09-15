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
  private fReadlineParser = new ReadlineParser({ delimiter: '\n', encoding: 'utf-8' });
  private fTextEncoder = new TextEncoder();
  private fTextDecoder = new TextDecoder();

  configure(options: ConfigurationOptions) {
    super.configure(options);
    this.fClientOptions = options;
  }

  protected onConnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.fClientOptions) return reject('fClientOptions is undefined');
      console.info(`Connecting to port "${this.fClientOptions.portName}" ...`);
      this.fSerialPort = new SerialPort(this.fClientOptions.portName, { autoOpen: false });
      this.fSerialPort.setEncoding('utf-8');
      this.fSerialPort.pipe(this.fReadlineParser);
      this.fSerialPort.once('end', () => this.fSerialPort = undefined);
      this.fSerialPort.on('error', (err) => console.error(err));
      this.fSerialPort.open((err) => {
        if (err) {
          if (this.fSerialPort) this.fSerialPort.close();
          return reject(err.message);
        }
        if (this.fSerialPort) {
          this.fSerialPort.flush(async () => {
            return resolve();
          });
        } else {
          return reject('fSerialPort is undefined');
        }
      });
    });
  }
  
  protected onDisconnect(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.fSerialPort) return resolve();
      if (this.fSerialPort.isOpen) this.fSerialPort.close();
      this.fSerialPort = undefined;
      return resolve();
    });
  }

  get isConnected(): boolean {
    if (!this.fSerialPort) return false;
    return !this.isConnecting && this.fSerialPort.isOpen && !this.fSerialPort.destroyed;
  }

  read(): Promise<ArrayBufferLike> {
    return new Promise<ArrayBufferLike>(async (resolve, reject) => {
      if (!this.fSerialPort) return reject('serialPort is undefined');
      const handleData = (data: string) => {
        this.fReadlineParser.off('data', handleData);
        data = data.trim();
        const retVal = this.fTextEncoder.encode(data);
        return resolve(retVal);
      }
      this.fReadlineParser.on('data', handleData);
      await this.writeString('++read');
    });
  }

  write(data: ArrayBuffer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.fSerialPort) return reject('serialPort is undefined');
      const dataString = this.fTextDecoder.decode(data);
      this.fSerialPort.write(`${dataString}\n`, (writeErr) => {
        if (writeErr) return reject(writeErr.message);
        if (!this.fSerialPort) return reject('serialPort is undefined');
        this.fSerialPort.drain((drainErr) => {
          if (drainErr) {
            return reject(drainErr.message);
          }
          return resolve();
        });
      });
    });
  }
  
}