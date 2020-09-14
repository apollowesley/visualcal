import { CommunicationInterface } from '../CommunicationInterface';
import { TextEncoder, TextDecoder } from 'util';
import electronLog from 'electron-log';

const log = electronLog.scope('PrologixGpibInterface');

export abstract class PrologixGpibInterface extends CommunicationInterface implements GpibInterface {
  
  async setDeviceAddress(address: number): Promise<void> {
    await this.writeString(`++addr ${address}`);
  }

  async onConnected() {
    await this.writeString('++savecfg 0');
    await this.setEndOfStringTerminator('Lf');
    await this.writeString('++mode 1');
    await this.writeString('++auto 0');
    await this.writeString('++ifc');
    log.debug('Prologix GPIB connected');
    await super.onConnected();
  }

  getEndOfStringTerminator(): Promise<EndOfStringTerminator> {
    return new Promise(async (resolve, reject) => {
      const readHandler: ReadQueueItem = {
        callback: (data, cancelled) => {
          if (cancelled) return reject('Cancelled');
          const eos = Number(data);
          switch (eos) {
            case 0:
              return resolve('CrLf');
            case 1:
              return resolve('Cr');
            case 2:
              return resolve('Lf');
            case 3:
              return resolve('none');
          }
        }
      }
      await this.writeString('++eos', 'utf-8', readHandler);
    });
  }

  async setEndOfStringTerminator(eos: EndOfStringTerminator): Promise<void> {
    switch (eos) {
      case 'CrLf':
        await this.writeString('++eos 0');
        break;
      case 'Cr':
        await this.writeString('++eos 1');
        break;
      case 'Lf':
        await this.writeString('++eos 2');
        break;
      case 'none':
        await this.writeString('++eos 3');
        break;
    }
  }

  async writeData(data: ArrayBuffer, readHandler?: ReadQueueItem): Promise<void> {
    let view = new Uint8Array(data);
    let viewString = new TextDecoder().decode(view);
    viewString = viewString + '\n';
    view = new TextEncoder().encode(viewString);
    data = view.buffer;
    await super.writeData(data, readHandler);
    if (readHandler) {
      // Auto read is turned off, so we need to send the ++read command to the Prologix GPIB controller
      await this.writeString('++read');
    }
  }

  address = 0;

  async selectedDeviceClear(): Promise<void> {
    await this.writeString('++clr');
  }

  async getEndOfInstruction(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = {
          tag: '++clr',
          callback: () => { return resolve(); }
        };
        await this.writeString('++clr', 'utf-8', response);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async setEndOfInstruction(enable: boolean): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  async getEndOfTransmission(): Promise<EndOfTransmissionOptions> {
    return Promise.reject('Method not implemented.');
  }

  async setEndOfTransmission(options: EndOfTransmissionOptions): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  async becomeControllerInCharge(): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  async gotToRemote(address: number): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  async goToLocal(address: number): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  async getListenOnly(): Promise<boolean> {
    return Promise.reject('Method not implemented.');
  }
  
  async setListenOnly(enable: boolean): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  async reset(): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  async serialPoll(primaryAddress: number, secondaryAddress?: number | undefined): Promise<StatusByteRegisterValues> {
    return new Promise(async (resolve, reject) => {
      try {
        let stringData = await this.queryString(`++spoll ${primaryAddress}`);
        stringData = stringData.replace('\n', '');
        const retVal = parseInt(stringData);
        return resolve(retVal);
      } catch (error) {
        this.onError(error);
        return reject(error);
      }
    });
  }

  async readStatusByte(): Promise<StatusByteRegisterValues> {
    return Promise.reject('Method not implemented.');
  }

  async readEventStatusRegister(): Promise<EventStatusRegisterValues> {
    return Promise.reject('Method not implemented.');
  }

  async getEventStatusEnable(): Promise<EventStatusRegisterValues> {
    return Promise.reject('Method not implemented.');
  }

  async setEventStatusEnable(values: EventStatusRegisterValues): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.writeString(`*ESE ${values}`)
        return resolve();
      } catch (error) {
        this.onError(error);
        return reject(error);        
      }
    });
  }

  async clearEventStatusEnable(): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  // eslint-disable-next-line
  async trigger(addresses: number | number[]): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

}
