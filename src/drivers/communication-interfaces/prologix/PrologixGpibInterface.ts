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
    await this.writeString('++auto 0');
    await this.writeString('++mode 1');
    await this.writeString('++ifc');
    await this.setEndOfStringTerminator('Lf');
    log.debug('Prologix GPIB connected');
    await super.onConnected();
  }

  async getEndOfStringTerminator(): Promise<EndOfStringTerminator> {
    const terminator = await this.queryString('++eos');
    const eos = parseInt(terminator);
    switch (eos) {
      case 0:
        return 'CrLf';
      case 1:
        return 'Cr';
      case 2:
        return 'Lf';
      case 3:
        return 'none';
    }
    return 'none';
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

  address = 0;

  async selectedDeviceClear(): Promise<void> {
    await this.writeString('++clr');
  }

  async getEndOfInstruction(): Promise<boolean> {
    return await this.queryString('++eoi') === '1';
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
