import { CommunicationInterface } from '../CommunicationInterface';
import path from 'path';
import edge from 'electron-edge-js';

interface ConnectInput {
  board: number;
  ifc: boolean;
  cic: boolean;
  cicImmediate: boolean;
}

interface ConnectOutput {
  Handle: string;
}

interface DisconnectInput {
  handle: string;
}

interface WriteToDeviceInput {
  handle: string;
  deviceAddress: number;
  data: ArrayBufferLike;
}

interface ReadFromDeviceInput {
  handle: string;
  deviceAddress: number;
}

export class NationalInstrumentsGpibInterface extends CommunicationInterface implements GpibInterface {

  private fNiGpibDotNetDllFilePath = path.join(__dirname, '..', '..', '..', '..', 'ni-gpib-dotnet-core', 'ni-gpib-dotnet-core', 'ni-gpib-dotnet-core', 'bin', 'Debug' , 'ni-gpib-dotnet-core.dll');
  private fHandle?: string = undefined;
  private fAddress: number = 0;
  private fDeviceAddress = 0;

  private getEdgeFunction<TInput, TOutput>(methodName: string) {
    const edgeFunction = edge.func<TInput, TOutput>({
      assemblyFile: this.fNiGpibDotNetDllFilePath,
      typeName: 'ni_gpib_dotnet_core.NationalInstrumentsGpibInterface',
      methodName: methodName // This must be Func<object,Task<object>>
    });
    return edgeFunction;
  }

  get address() {
    return this.fAddress;
  }
  set address(value: number) {
    this.fAddress = value;
  }

  async setDeviceAddress(address: number): Promise<void> {
    this.fDeviceAddress = address;
    await Promise.resolve();
  }

  selectedDeviceClear(address?: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getEndOfInstruction(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  setEndOfInstruction(enable: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getEndOfTransmission(): Promise<EndOfTransmissionOptions> {
    throw new Error('Method not implemented.');
  }

  setEndOfTransmission(options: EndOfTransmissionOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  becomeControllerInCharge(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  gotToRemote(address: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  goToLocal(address: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getListenOnly(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  setListenOnly(enable: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }

  reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  serialPoll(primaryAddress: number, secondaryAddress?: number): Promise<StatusByteRegisterValues> {
    throw new Error('Method not implemented.');
  }

  readStatusByte(): Promise<StatusByteRegisterValues> {
    throw new Error('Method not implemented.');
  }

  readEventStatusRegister(): Promise<EventStatusRegisterValues> {
    throw new Error('Method not implemented.');
  }

  getEventStatusEnable(): Promise<EventStatusRegisterValues> {
    throw new Error('Method not implemented.');
  }

  setEventStatusEnable(values: EventStatusRegisterValues): Promise<void> {
    throw new Error('Method not implemented.');
  }

  clearEventStatusEnable(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  trigger(addresses: number | number[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  get isConnected(): boolean {
    return this.fHandle !== undefined;
  }

  protected onDisconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!this.fHandle) return reject('No connected');
        const edgeDisconnect = this.getEdgeFunction<DisconnectInput, boolean>('Disconnect');
        edgeDisconnect({
          handle: this.fHandle
        }, (err) => {
          if (err) return reject(err);
          return resolve();
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  protected onConnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const edgeConnect = this.getEdgeFunction<ConnectInput, ConnectOutput>('Connect');
        edgeConnect({
          board: this.address,
          cic: true,
          ifc: true,
          cicImmediate: true
        }, (err, result) => {
          if (err) return reject(err);
          this.fHandle = result.Handle;
          return resolve();
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  write(data: ArrayBuffer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!this.fHandle) return reject('No connected');
        const edigeWriteToDevice = this.getEdgeFunction<WriteToDeviceInput, boolean>('WriteToDevice');
        edigeWriteToDevice({
          handle: this.fHandle,
          deviceAddress: this.fDeviceAddress,
          data: data
        }, (err) => {
          if (err) return reject(err);
          return resolve();
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  read(): Promise<ArrayBufferLike> {
    return new Promise<ArrayBufferLike>((resolve, reject) => {
      try {
        if (!this.fHandle) return reject('No connected');
        const edigeReadFromDevice = this.getEdgeFunction<ReadFromDeviceInput, ArrayBufferLike>('ReadFromDevice');
        edigeReadFromDevice({
          handle: this.fHandle,
          deviceAddress: this.fDeviceAddress
        }, (err, result) => {
          if (err) return reject(err);
          return resolve(result);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

}
