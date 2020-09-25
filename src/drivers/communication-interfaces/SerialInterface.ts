import electronLog from 'electron-log';
import SerialPort from 'serialport';
import { CommunicationInterface } from './CommunicationInterface';
import ReadlineParser from '@serialport/parser-readline';

interface ConfigurationOptions extends CommunicationInterfaceConfigurationOptions {
  portName: string;
  baudRate?: number;
  dataBits?: 5 | 6 | 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'mark' | 'odd' | 'space';

}

const log = electronLog.scope('SerialInterface');

export class SerialInterface extends CommunicationInterface {

  private fClient?: SerialPort = undefined;
  private fClientOptions?: ConfigurationOptions = undefined;
  private fTextDecoder = new TextDecoder();
  private fReadlineParser = new ReadlineParser({ delimiter: '\n', encoding: 'utf-8' });

  protected get readLineParser() { return this.fReadlineParser; }

  protected getIsConnected(): boolean {
    if (!this.fClient) return false;
    return !this.fClient.isOpen && !this.fClient.destroyed;
  }

  protected onConnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!this.fClientOptions) throw 'Not configured';
        log.info(`Connecting to port "${this.fClientOptions.portName}" ...`);
        if (!this.fClientOptions) throw 'No configured';
        this.fClient = new SerialPort(this.fClientOptions.portName, {
          autoOpen: false,
          baudRate: this.fClientOptions.baudRate || 9600,
          parity: this.fClientOptions.parity || 'none',
          dataBits: this.fClientOptions.dataBits || 8,
          stopBits: this.fClientOptions.stopBits || 1
        });
        this.fClient.pipe(this.readLineParser);
        this.fClient.once('end', () => this.fClient = undefined);
        this.fClient.open((err) => {
          if (err) {
            if (this.fClient) this.fClient.close();
            return reject(err.message);
          }
          if (this.fClient) {
            this.fClient.flush(async () => {
              return resolve();
            });
          } else {
            return reject('Client is undefined');
          }
        });
      } catch (error) {
        this.onError(error);
        return reject(error);
      }
    });
  }

  configure(options: ConfigurationOptions) {
    super.configure(options);
    this.fClientOptions = options;
  }

  protected onDisconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.fClient) return resolve();
      try {
        this.fClient.removeAllListeners();
        if (this.isConnected) this.fClient.close();
      } catch (error) {
        this.onError(error);
      }
      this.fClient = undefined;
      return resolve();
    });
  }

  read(): Promise<ArrayBufferLike> {
    return new Promise<ArrayBufferLike>((resolve, reject) => {
      if (!this.fClient || !this.isConnected) return reject('Not connected or fClient is undefined');
      const textEncoder = new TextEncoder();
      const handleError = (err: Error) => {
        if (!this.fClient) return reject(err.message);
        this.fClient.removeListener('error', handleError);
        this.fReadlineParser.removeListener('data', handleData);
      }
      const handleData = (data: string) => {
        if (this.fClient) this.fClient.removeListener('error', handleError);
        this.fReadlineParser.removeListener('data', handleData);
        const retVal = textEncoder.encode(data).buffer;
        return resolve(retVal);
      }
      this.fClient.addListener('error', handleError);
      this.fReadlineParser.addListener('data', handleData);
    });
  }

  write(data: ArrayBuffer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.fClient) return reject('client is undefined');
      const dataString = this.fTextDecoder.decode(data);
      this.fClient.write(`${dataString}\n`, (writeErr) => {
        if (writeErr) return reject(writeErr);
        if (!this.fClient) return reject('client is undefined');
        this.fClient.drain((drainErr) => {
          if (drainErr) {
            return reject(drainErr);
          }
          log.info(`PrologixGpibUsbInterface.write`, dataString);
          return resolve();
        });
      });
    });
  }

}