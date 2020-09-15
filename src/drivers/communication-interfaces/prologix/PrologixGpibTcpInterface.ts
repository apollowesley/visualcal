import { PrologixGpibInterface } from './PrologixGpibInterface';
import { Socket } from 'net';
import electronLog from 'electron-log';
import ReadlineParser from '@serialport/parser-readline';

const log = electronLog.scope('PrologixGpibTcpInterface');

interface ConfigurationOptions extends CommunicationInterfaceConfigurationOptions {
  host: string;
  port: number | 1234;
}

export class PrologixGpibTcpInterface extends PrologixGpibInterface {
  
  private fClient?: Socket = undefined;
  private fClientOptions?: ConfigurationOptions = undefined;
  private fReadlineParser = new ReadlineParser({ delimiter: '\n', encoding: 'utf-8' });

  protected onConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.fClientOptions) throw 'Not configured';
        this.fClient = new Socket();
        this.fClient.pipe(this.fReadlineParser);
        this.fClient.on('close', async () => await this.disconnect());
        this.fClient.on('end', async () => await this.disconnect());
        this.fClient.on('error', (err) => this.onError(err));
        this.fClient.on('timeout', async () => await this.disconnect());
        this.fClient.once('connect', () => {
          log.debug('Prologix GPIB TCP connected');
          return resolve();
        });
        this.fClient.connect({
          host: this.fClientOptions.host,
          port: this.fClientOptions.port
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  protected onDisconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.fClient) {
        this.fClient.removeAllListeners();
        try {
          this.fClient.end();
          this.fClient.destroy();
        } catch (error) {
          log.debug('Expected possible error: ' + error);
        }
      }
      this.fClient = undefined;
      return resolve();
    });
  }

  configure(options: ConfigurationOptions) {
    super.configure(options);
    this.fClientOptions = options;
  }

  get isConnected(): boolean {
    if (!this.fClient) return false;
    return !this.isConnecting && !this.fClient.connecting && !this.fClient.destroyed;
  }

  read(): Promise<ArrayBufferLike> {
    return new Promise<ArrayBufferLike>(async (resolve, reject) => {
      if (!this.fClient || !this.isConnected) return reject('Not connected or fClient is undefined');
      const textEncoder = new TextEncoder();
      const handleError = (err: Error) => {
        if (!this.fClient) return reject(err.message);
        this.fClient.removeListener('error', handleError);
        this.fReadlineParser.off('data', handleData);
      }
      const handleData = (data: string) => {
        if (this.fClient) this.fClient.removeListener('error', handleError);
        this.fReadlineParser.off('data', handleData);
        const retVal = textEncoder.encode(data).buffer;
        return resolve(retVal);
      }
      this.fClient.addListener('error', handleError);
      this.fReadlineParser.on('data', handleData);
      await this.writeString('++read');
    });
  }

  write(data: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.fClient) {
          const errMsg = 'No connection';
          this.onError(new Error(errMsg));
          return reject(errMsg);
        }
        const view = new Uint8Array(data);
        const result = this.fClient.write(view);
        if (result) return resolve();
        else return reject('Error writing data to Prologix GPIB TCP over socket');
      } catch (error) {
        this.onError(error);
        reject(error);
      }
    });
  }
  
}
