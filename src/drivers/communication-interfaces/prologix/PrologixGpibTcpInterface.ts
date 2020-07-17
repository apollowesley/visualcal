import { PrologixGpibInterface } from './PrologixGpibInterface';
import { Socket } from 'net';

export interface ConfigurationOptions extends CommunicationInterfaceConfigurationOptions {
  host: string;
  port: number | 1234;
}

export class PrologixGpibTcpInterface extends PrologixGpibInterface {
  
  private fClient?: Socket = undefined;
  private fClientOptions?: ConfigurationOptions = undefined;
  private fConnecting: boolean = false;

  async connect(): Promise<void> {
    if (this.fConnecting) {
      this.fConnecting = false;
      this.disconnect();
      throw new Error('Already connecting');
    }
    return new Promise((resolve, reject) => {
      this.fConnecting = true;
      try {
        if (!this.fClientOptions) throw 'Not configured';
        this.fClient = new Socket();
        this.fClient.on('close', () => this.disconnect());
        this.fClient.on('end', () => this.disconnect());
        this.fClient.on('error', (err) => this.onError(err));
        this.fClient.on('timeout', () => this.disconnect());
        this.fClient.on('data', (data) => this.onData(data));
        this.fClient.once('connect', async () => {
          await super.onConnected();
          this.fConnecting = false;
          return resolve();
        });
        this.fClient.connect({
          host: this.fClientOptions.host,
          port: this.fClientOptions.port
        });
      } catch (error) {
        this.disconnect();
        this.onError(error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.fClient) {
      this.fClient.removeAllListeners();
      try {
        this.fClient.end();
        this.fClient.destroy();
      } catch (error) {
        console.debug('Expected error: ' + error);
      } finally {
        this.fClient = undefined;
      }
    }
    this.onDisconnected();
  }

  configure(options: ConfigurationOptions) {
    super.configure(options);
    this.fClientOptions = options;
  }

  get isConnected(): boolean {
    if (!this.fClient) return false;
    return !this.fConnecting && !this.fClient.connecting && !this.fClient.destroyed;
  }

  async setDeviceAddress(address: number): Promise<void> {
    console.debug(`Setting device GPIB address to ${address}`);
    const data: string[] = ['++auto 0', `++addr ${address}`, '++auto 1'];
    data.forEach(d => {
      if (!this.fClient) {
        const errMsg = 'No connection';
        const err = new Error(errMsg);
        this.onError(err);
        throw err;
      }
      const buffer = Buffer.from(`${d}\n`, 'utf-8');
      const view = new Uint8Array(buffer);
      this.fClient.write(view);
    });
    console.debug(`Device GPIB address set to ${address}`);
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
