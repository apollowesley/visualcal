import { PrologixGpibInterface } from './PrologixGpibInterface';
import { Socket } from 'net';
import electronLog from 'electron-log';

const log = electronLog.scope('PrologixGpibTcpInterface');

interface ConfigurationOptions extends CommunicationInterfaceConfigurationOptions {
  host: string;
  port: number | 1234;
}

export class PrologixGpibTcpInterface extends PrologixGpibInterface {
  
  private fClient?: Socket = undefined;
  private fClientOptions?: ConfigurationOptions = undefined;
  private fConnecting: boolean = false;

  get manufacturerModelType(): CommunicationInterfaceManufacturerModelType {
    return {
      manufacturer: 'Prologix',
      model: 'GPIB TCP',
      type: 'Prologix GPIB TCP'
    }
  }

  async connect(): Promise<void> {
    if (this.fConnecting) {
      this.fConnecting = false;
      this.disconnect();
      throw new Error('Already connecting');
    }
    return new Promise((resolve, reject) => {
      this.fConnecting = true;
      this.onConnecting();
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
    const wasConnected = this.isConnected;
    if (this.fClient) {
      this.fClient.removeAllListeners();
      try {
        this.fClient.end();
        this.fClient.destroy();
      } catch (error) {
        log.debug('Expected error: ' + error);
      } finally {
        this.fClient = undefined;
      }
    }
    if (wasConnected) this.onDisconnected();
  }

  configure(options: ConfigurationOptions) {
    super.configure(options);
    this.fClientOptions = options;
  }

  get isConnected(): boolean {
    if (!this.fClient) return false;
    return !this.fConnecting && !this.fClient.connecting && !this.fClient.destroyed;
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
