import { Device } from './Device';
import { DeviceDefinition } from './device-interfaces';
import { CommunicationInterface } from '../communication-interfaces/CommunicationInterface';

export abstract class ControllableDevice extends Device implements IControllableDevice {

  private fCommunicationInterface?: CommunicationInterface = undefined;

  protected constructor(definition: DeviceDefinition) {
    super(definition);
  }

  get communicationInterface() { return this.fCommunicationInterface; }

  setCommunicationInterface(communicationInterface: ICommunicationInterface) {
    this.fCommunicationInterface = communicationInterface as CommunicationInterface;
  }

  private async write(data: ArrayBuffer | string, readHandler?: ReadQueueItem) {
    if (!this.fCommunicationInterface) throw new Error('Communication interface must be set');
    if (typeof data === 'object') {
      await this.fCommunicationInterface.writeData(data, readHandler);
      this.emit('write', this.fCommunicationInterface, data);
      return;
    }
    const dataArrayBuffer = new TextEncoder().encode(data);
    await this.fCommunicationInterface.writeData(dataArrayBuffer, readHandler);
    this.emit('write', this.fCommunicationInterface, dataArrayBuffer);
  }

  async writeString(data: string) {
    await this.write(data);
  };

  queryString(data: ArrayBuffer | string) {
    return new Promise<string>(async (resolve, reject) => {
      const readHandler: ReadQueueItem = {
        callback: (data, cancelled) => {
          if (this.fCommunicationInterface) this.emit('dataReceived', this.fCommunicationInterface, data);
          if (cancelled) return reject();
          const dataString = new TextDecoder().decode(data);
          if (this.fCommunicationInterface) this.emit('stringReceived', this.fCommunicationInterface, dataString);
          return resolve(dataString);
        },
        cancelCallback: () => {
          return reject();
        }
      };
      await this.write(data, readHandler);
    });
  }

}
