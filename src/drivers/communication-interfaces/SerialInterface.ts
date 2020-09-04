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

  get manufacturerModelType(): CommunicationInterfaceManufacturerModelType {
    return {
      manufacturer: 'Generic',
      model: 'Serial Interface',
      type: 'Serial Port'
    }
  }

  get isConnected(): boolean {
    if (!this.fPort) return false;
    return this.fPort.isOpen;
  }

  async connect(): Promise<void> {
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
        this.fPort.addListener('close', this.onDisconnected);
        this.fPort.addListener('end', this.disconnect);
        this.fPort.addListener('error', this.onError);
        this.fPort.addListener('data', this.onData);
        this.fPort.open();
        this.onConnected();
        return resolve();
      } catch (error) {
        this.disconnect();
        this.onError(error);
        return reject(error);
      }
    });
  }

  configure(options: ConfigurationOptions) {
    super.configure(options);
    this.fPortOptions = options;
  }

  disconnect(): void {
    if (!this.fPort) return;
    this.fPort.removeAllListeners();
    try {
      if (this.isConnected) this.fPort.close();
    } catch (error) {
      this.onError(error);
    } finally {
      this.fPort = undefined;
      this.onDisconnected();
    }
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
        reject(error);
      }
    });
  }

}