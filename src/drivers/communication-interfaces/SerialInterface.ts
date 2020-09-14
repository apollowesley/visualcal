import SerialPort from 'serialport';
import { CommunicationInterface } from './CommunicationInterface';

interface ConfigurationOptions extends CommunicationInterfaceConfigurationOptions {
  portName: string;
  baudRate?: number;
  dataBits?: 5 | 6 | 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'mark' | 'odd' | 'space';

}

export class SerialInterface extends CommunicationInterface {

  private fPort?: SerialPort = undefined;
  private fPortOptions?: ConfigurationOptions = undefined;

  get isConnected(): boolean {
    if (!this.fPort) return false;
    return this.fPort.isOpen;
  }

  protected onConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.fPortOptions) throw 'No configured';
        this.fPort = new SerialPort(this.fPortOptions.portName, {
          autoOpen: false,
          baudRate: this.fPortOptions.baudRate || 9600,
          parity: this.fPortOptions.parity || 'none',
          dataBits: this.fPortOptions.dataBits || 8,
          stopBits: this.fPortOptions.stopBits || 1
        });
        this.fPort.once('close', async () => await this.onDisconnected());
        this.fPort.once('end', async () => await this.disconnect());
        this.fPort.on('error', this.onError);
        this.fPort.once('data', this.onData);
        this.fPort.open();
        return resolve();
      } catch (error) {
        this.onError(error);
        return reject(error);
      }
    });
  }

  configure(options: ConfigurationOptions) {
    super.configure(options);
    this.fPortOptions = options;
  }

  protected onDisconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.fPort) return resolve();
      try {
        this.fPort.removeAllListeners();
        if (this.isConnected) this.fPort.close();
      } catch (error) {
        this.onError(error);
      }
      this.fPort = undefined;
      return resolve();
    });
  }

  write(data: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.fPort) {
          const errMsg = 'Port is not open';
          this.onError(new Error(errMsg));
          return reject(errMsg);
        }
        const buf = Buffer.alloc(data.byteLength);
        const view = new Uint8Array(data);
        for (let i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        this.fPort.write(buf);
        resolve();
      } catch (error) {
        this.onError(error);
        return reject(error);
      }
    });
  }

}