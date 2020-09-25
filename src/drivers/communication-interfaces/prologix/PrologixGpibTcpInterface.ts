import electronLog from 'electron-log';
import { Socket } from 'net';
import { PrologixGpibInterface } from './PrologixGpibInterface';

const log = electronLog.scope('PrologixGpibTcpInterface');

interface ConfigurationOptions extends CommunicationInterfaceConfigurationOptions {
  host: string;
  port: number | 1234;
}

export class PrologixGpibTcpInterface extends PrologixGpibInterface {

  private fClient?: Socket = undefined;
  private fClientOptions?: ConfigurationOptions = undefined;

  protected get duplexClient() { return this.fClient; };

  configure(options: ConfigurationOptions) {
    super.configure(options);
    this.fClientOptions = options;
  }

  protected onConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.fClientOptions) throw 'Not configured';
        this.fClient = new Socket();
        this.fClient.pipe(this.readLineParser);
        this.fClient.on('timeout', async () => {
          this.onError(new Error('Timeout'));
          await this.disconnect();
        });
        this.fClient.connect(this.fClientOptions.port, this.fClientOptions.host, () => {
          if (!this.fClient) return reject('Client is not defined');
          return resolve();
        });
      } catch (error) {
        this.onError(error);
        return reject(error);
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

  protected getIsConnected(): boolean {
    if (!this.fClient) return false;
    return !this.fClient.connecting && !this.fClient.destroyed;
  }

}
