import ReadlineParser from '@serialport/parser-readline';
import { CommunicationInterface } from '../CommunicationInterface';
import electronLog from 'electron-log';
import { GpibInterface, StatusByteRegister, EventStatusRegister, StatusByteRegisterValues, EventStatusRegisterValues } from '../GPIB';
import * as Stream from 'stream';

const log = electronLog.scope('PrologixGpibInterface');

export abstract class PrologixGpibInterface extends CommunicationInterface implements GpibInterface {
  
  private fReadlineParser = new ReadlineParser({ delimiter: '\n', encoding: 'ascii' });
  private fTextEncoder = new TextEncoder();

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

  protected get readLineParser() { return this.fReadlineParser; }
  protected abstract get duplexClient(): Stream.Duplex | undefined;

  read(): Promise<ArrayBufferLike> {
    return new Promise<ArrayBufferLike>(async (resolve, reject) => {
      if (!this.duplexClient || !this.isConnected) return reject('Not connected or client is undefined');
      const handleError = (err: Error) => {
        if (this.duplexClient) this.duplexClient.removeAllListeners('error');
        this.fReadlineParser.off('data', handleData);
        if (!this.duplexClient) return reject(err.message);
      }
      const handleData = (data: string) => {
        if (this.duplexClient) this.duplexClient.removeAllListeners('error');
        this.fReadlineParser.off('data', handleData);
        const retVal = this.fTextEncoder.encode(data).buffer;
        return resolve(retVal);
      }
      this.duplexClient.once('error', handleError);
      this.fReadlineParser.on('data', handleData);
      await this.writeString('++read');
    });
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

  async selectedDeviceClear(address?: number): Promise<void> {
    if (address) await this.setDeviceAddress(address);
    await this.writeString('++clr');
  }

  async getEndOfInstruction(): Promise<boolean> {
    return await this.queryString('++eoi') === '1';
  }

  async setEndOfInstruction(enable: boolean): Promise<void> {
    await this.writeString(`++eoi ${enable ? '1' : '0'}`);
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

  async serialPoll(primaryAddress: number, secondaryAddress?: number): Promise<StatusByteRegister> {
    let valueString = await this.queryString(`++spoll ${primaryAddress}`);
    const value = parseInt(valueString) as StatusByteRegisterValues;
    return new StatusByteRegister(value);
  }

  async readStatusByte(): Promise<StatusByteRegister> {
    return Promise.reject('Method not implemented.');
  }

  async clearStatusByte(): Promise<void> {
    await this.writeString('*CLS');
  }

  async readEventStatusRegister(): Promise<EventStatusRegister> {
    const valueString = await this.queryString(`*ESR?`);
    const value = parseInt(valueString) as EventStatusRegisterValues;
    return new EventStatusRegister(value);
  }

  async getEventStatusEnable(): Promise<EventStatusRegister> {
    const valueString = await this.queryString(`*ESE?`);
    const value = parseInt(valueString) as EventStatusRegisterValues;
    return new EventStatusRegister(value);
  }

  async setEventStatusEnable(values: EventStatusRegisterValues): Promise<void> {
    await this.writeString(`*ESE ${values}`);
  }

  async clearEventStatusEnable(): Promise<void> {
    await this.writeString('*ESE 0');
  }

  // eslint-disable-next-line
  async trigger(addresses: number | number[]): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

}
