import { CommunicationInterface } from '../CommunicationInterface';
import { TextEncoder, TextDecoder } from 'util';

export abstract class PrologixGpibInterface extends CommunicationInterface implements GpibInterface {
  
  async setDeviceAddress(address: number): Promise<void> {
    return this.writeString(`++addr ${address}`);
  }

  async onConnected() {
    await this.writeString('++savecfg 0');
    await this.writeString('++mode 1');
    await this.writeString('++auto 1');
    await this.writeString('++ifc');
    setTimeout(() => {
      console.debug('Prologix GPIB connected');
      super.onConnected();
    }, 1000);
  }

  writeData(data: ArrayBuffer, readHandler?: ReadQueueItem): Promise<void> {
    let view = new Uint8Array(data);
    let viewString = new TextDecoder().decode(view);
    viewString = viewString + '\n';
    view = new TextEncoder().encode(viewString);
    data = view.buffer;
    return super.writeData(data, readHandler);
  }

  address = 0;

  selectedDeviceClear(): Promise<void> {
    return this.writeString('++clr');
  }

  async getEndOfInstruction(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const response = {
          tag: '++clr',
          callback: () => { return resolve(); }
        };
        this.writeString('++clr', 'utf-8', response);
      } catch (error) {
        return reject(error);
      }
    });
  }

  // eslint-disable-next-line
  async setEndOfInstruction(enable: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getEndOfStringTerminator(): Promise<EndOfStringTerminator> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line
  async setEndOfStringTerminator(eos: EndOfStringTerminator): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getEndOfTransmission(): Promise<EndOfTransmissionOptions> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line
  async setEndOfTransmission(options: EndOfTransmissionOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async becomeControllerInCharge(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line
  async gotToRemote(address: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line
  async goToLocal(address: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getListenOnly(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  
  // eslint-disable-next-line
  async setListenOnly(enable: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line
  async serialPoll(primaryAddress: number, secondaryAddress?: number | undefined): Promise<StatusByteRegisterValues> {
    return new Promise((resolve, reject) => {
      this.queryString(`++spoll ${primaryAddress}`)
      .then(stringData => {
        stringData = stringData.replace('\n', '');
        const retVal = parseInt(stringData);
        return resolve(retVal);
      })
      .catch(error => {
        this.onError(error);
        return reject(error);
      });
    });
  }

  async readStatusByte(): Promise<StatusByteRegisterValues> {
    throw new Error('Method not implemented.');
  }

  async readEventStatusRegister(): Promise<EventStatusRegisterValues> {
    throw new Error('Method not implemented.');
  }

  async getEventStatusEnable(): Promise<EventStatusRegisterValues> {
    throw new Error('Method not implemented.');
  }

  async setEventStatusEnable(values: EventStatusRegisterValues): Promise<void> {
    return new Promise((resolve, reject) => {
        this.writeString(`*ESE ${values}`)
        .then(() => resolve())
        .catch(error => {
          this.onError(error);
          return reject(error);
        });
      });
  }

  async clearEventStatusEnable(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line
  async trigger(addresses: number | number[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

}
