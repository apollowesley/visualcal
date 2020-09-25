import ReadlineParser from '@serialport/parser-readline';
import { CommunicationInterface } from '../CommunicationInterface';
import electronLog from 'electron-log';
import { GpibInterface, StatusByteRegister, EventStatusRegister, StatusByteRegisterValues, EventStatusRegisterValues } from '../GPIB';
import * as Stream from 'stream';
import { sleep } from '../../utils';

const log = electronLog.scope('PrologixGpibInterface');

const enum Mode {
  Device,
  Controller
}

export abstract class PrologixGpibInterface extends CommunicationInterface implements GpibInterface {
  
  private fReadlineParser = new ReadlineParser({ delimiter: '\n', encoding: 'ascii' });
  private fTextEncoder = new TextEncoder();

  async setDeviceAddress(address: number): Promise<void> {
    await this.writeString(`++addr ${address}`);
  }

  async onConnected() {
    await super.onConnected();
    await this.reset();
    await sleep(1000);
    const version = await this.getVersion();
    await this.writeString('++savecfg 0');
    await this.setMode(Mode.Controller);
    await this.setAutoReadAfterWrite(false);
    await this.setEndOfStringTerminator('Lf');
    await this.setEndOfInstruction(true);
    await this.writeString('++read_tmo_ms 3000');
    await this.interfaceClear();
    log.info(`Connected to Prologix controller, version ${version}`);
  }

  protected get readLineParser() { return this.fReadlineParser; }
  protected abstract get duplexClient(): Stream.Duplex | undefined;

  read(): Promise<ArrayBufferLike> {
    return new Promise<ArrayBufferLike>(async (resolve, reject) => {
      if (!this.duplexClient || !this.isConnected) {
        const error = new Error('Not connected or client is undefined');
        this.onError(error);
        return reject(error);
      };
      this.duplexClient.removeAllListeners('error');
      const handleError = (err: Error) => {
        if (this.duplexClient) this.duplexClient.removeAllListeners('error');
        this.fReadlineParser.off('data', handleData);
        this.onError(err);
        return reject(err);
      }
      const handleData = (data: string) => {
        if (this.duplexClient) this.duplexClient.removeAllListeners('error');
        this.fReadlineParser.off('data', handleData);
        const retVal = this.fTextEncoder.encode(data).buffer;
        return resolve(retVal);
      }
      this.duplexClient.once('error', handleError);
      this.fReadlineParser.on('data', handleData);
      await this.writeString('++read eoi');
    });
  }

  async getVersion() {
    return await this.queryString('++ver');
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

  async setMode(mode: Mode) {
    await this.writeString(`++mode ${ mode === Mode.Device ? '0' : '1' }`);
  }

  async setAutoReadAfterWrite(enable: boolean) {
    await this.writeString(`++auto ${enable ? '1' : '0'}`);
  }

  async interfaceClear() {
    await this.writeString('++ifc');
    await sleep(150); // Manual says 150 microseconds, but we can't sleep that short of time
  }

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
    const character = parseInt(await this.queryString('++eot_char'));
    const enabled = parseInt(await this.queryString('++eot_enable')) === 1;
    return {
      character: character,
      enabled: enabled
    };
  }

  async setEndOfTransmission(options: EndOfTransmissionOptions): Promise<void> {
    await this.writeString(`++eot_char ${options.character}`);
    await this.writeString(`++eot_enable ${options.enabled ? '1' : '0'}`);
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
    log.info('Reseting');
    await this.writeString('++rst');
    await sleep(6000);
  }

  async serialPoll(primaryAddress: number, secondaryAddress?: number): Promise<StatusByteRegister> {
    if (secondaryAddress && (secondaryAddress < 96 || secondaryAddress > 126)) throw new Error(`Supplied secondary address, ${secondaryAddress}, is outside the range of valid values, 96-126`);
    const secondaryAddressString = secondaryAddress ? ` ${secondaryAddress}` : '';
    let valueString = await this.queryString(`++spoll ${primaryAddress}${secondaryAddressString}`);
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
