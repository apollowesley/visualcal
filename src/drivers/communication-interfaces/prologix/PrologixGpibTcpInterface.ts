import { PrologixGpibInterface } from './PrologixGpibInterface';
import { Socket } from 'net';
import electronLog from 'electron-log';
import { reject } from 'lodash';

const log = electronLog.scope('PrologixGpibTcpInterface');

interface ConfigurationOptions extends CommunicationInterfaceConfigurationOptions {
  host: string;
  port: number | 1234;
}

export class PrologixGpibTcpInterface extends PrologixGpibInterface {
  
  private fClient?: Socket = undefined;
  private fClientOptions?: ConfigurationOptions = undefined;
  
  protected onConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.fClientOptions) throw 'Not configured';
        this.fClient = new Socket();
        this.fClient.on('close', async () => await this.disconnect());
        this.fClient.on('end', async () => await this.disconnect());
        this.fClient.on('error', (err) => this.onError(err));
        this.fClient.on('timeout', async () => await this.disconnect());
        this.fClient.on('data', (data) => this.onData(data));
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
