import electronLog from 'electron-log';
import SerialPort from 'serialport';
import { TextDecoder } from 'util';
import { PrologixGpibInterface } from './PrologixGpibInterface';

const log = electronLog.scope('PrologixGpibUsbInterface');

interface ConfigurationOptions extends CommunicationInterfaceConfigurationOptions {
  portName: string;
}

export class PrologixGpibUsbInterface extends PrologixGpibInterface {

  private fClient?: SerialPort = undefined;
  private fClientOptions?: ConfigurationOptions = undefined;
  
  configure(options: ConfigurationOptions) {
    super.configure(options);
    this.fClientOptions = options;
  }

  protected get duplexClient() { return this.fClient; };

  protected onConnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!this.fClientOptions) throw 'Not configured';
        log.info(`Connecting to port "${this.fClientOptions.portName}" ...`);
        this.fClient = new SerialPort(this.fClientOptions.portName, { autoOpen: false });
        this.fClient.pipe(this.readLineParser);
        this.fClient.open(async (err) => {
          if (err) {
            await this.disconnect();
            this.onError(err);
            return reject(err);
          }
          if (this.fClient) {
            this.fClient.flush(async () => {
              return resolve();
            });
          } else {
            const clientUndefinedError = new Error('Client is undefined');
            this.onError(clientUndefinedError);
            return reject(clientUndefinedError);
          }
        });
      } catch (error) {
        this.onError(error);
        return reject(error);
      }
    });
  }
  
  protected onDisconnect(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.fClient && this.getIsConnected()) {
        try {
          this.fClient.close();
        } catch (error) {
          log.warn('Error closing serial port.  We are disconnecting anyway, so this error can be ignored.');
          log.error(error);
        }
      }
      this.fClient = undefined;
      return resolve();
    });
  }

  protected getIsConnected(): boolean {
    if (!this.fClient) return false;
    return !this.fClient.isOpen || !this.fClient.destroyed;
  }

  protected onPrologixDataSent() {
    return new Promise<void>((resolve, reject) => {
      if (!this.fClient) {
        const err = new Error('Client is undefined');
        this.onError(err);
        return reject(err);
      }
      this.fClient.drain((drainErr) => {
        if (drainErr) {
          this.onError(drainErr);
          return reject(drainErr);
        }
        return resolve();
      });
    });
  }
 
}
