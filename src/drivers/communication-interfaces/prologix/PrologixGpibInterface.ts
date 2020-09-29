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
  private fTextDecoder = new TextDecoder();

  async onConnected() {
    await super.onConnected();
    await this.reset();
    // const version = await this.getVersion();
    await this.writeToController('++savecfg 0');
    await this.setMode(Mode.Controller);
    await this.setAutoReadAfterWrite(false);
    await this.setEndOfStringTerminator('Lf');
    await this.setEndOfInstruction(true);
    await this.writeToController('++read_tmo_ms 3000');
    await this.interfaceClear();
    // log.info(`Connected to Prologix controller, version ${version}`);
  }

  protected get readLineParser() { return this.fReadlineParser; }
  protected abstract get duplexClient(): Stream.Duplex | undefined;

  /**
   * Writes to the controller, bypassing any parent handling
   * @param data data to be sent
   */
  protected async onPrologixDataSent() {
    await Promise.resolve();
  };

  write(data: ArrayBufferLike) {
    return new Promise<void>((resolve, reject) => {
      if (!this.duplexClient) {
        const err = new Error('Client is undefined');
        this.onError(err);
        return reject(err);
      }
      const dataString = this.fTextDecoder.decode(data);
      this.duplexClient.write(`${dataString}\n`, async (writeErr) => {
        if (writeErr) return reject(writeErr);
        if (!this.duplexClient) {
          const err = new Error('Client is undefined');
          this.onError(err);
          return reject(err);
        }
        await this.onPrologixDataSent();
        log.info(`Write`, dataString);
        return resolve();
      });
    });
  }

  protected async writeToController(command: string) {
    const data = this.fTextEncoder.encode(command);
    await this.onBeforeWrite(data);
    await this.write(data);
    await this.onAfterWrite(data);
  }

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
      await this.writeToController('++read eoi');
    });
  }

  protected readFromController() {
    return new Promise<string>(async (resolve, reject) => {
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
        return resolve(data);
      }
      this.duplexClient.once('error', handleError);
      this.fReadlineParser.on('data', handleData);
      await this.writeToController('++read');
    });
  }

  protected async queryController(query: string) {
    await this.writeToController(query);
    return await this.readFromController();
  }

  // private fPreviousWriteData?: ArrayBufferLike;
  // async writeData(data: ArrayBufferLike) {
  //   const srq = await this.checkSRQ();
  //   if (srq) {
  //     let errMsg = 'GPIB SRQ detected after previous write';
  //     if (this.fPreviousWriteData) {
  //       const previousWriteDataString = this.fTextDecoder.decode(this.fPreviousWriteData);
  //       errMsg = `GPIB SRQ detected after previous write of:  ${previousWriteDataString}`;
  //     }
  //     const serialPollStatus = await this.serialPoll();
  //     log.info(serialPollStatus.value);
  //     const err = new Error(errMsg);
  //     this.onError(err);
  //     throw new Error(err.message);
  //   }
  //   await super.writeData(data);
  // }

  async setDeviceAddress(address: number): Promise<void> {
    await this.writeToController(`++addr ${address}`);
  }

  async getVersion() {
    return await this.queryController('++ver');
  }

  async getEndOfStringTerminator(): Promise<EndOfStringTerminator> {
    const terminator = await this.queryController('++eos');
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
        await this.writeToController('++eos 0');
        break;
      case 'Cr':
        await this.writeToController('++eos 1');
        break;
      case 'Lf':
        await this.writeToController('++eos 2');
        break;
      case 'none':
        await this.writeToController('++eos 3');
        break;
    }
  }

  address = 0;

  async setMode(mode: Mode) {
    await this.writeToController(`++mode ${ mode === Mode.Device ? '0' : '1' }`);
  }

  async setAutoReadAfterWrite(enable: boolean) {
    await this.writeToController(`++auto ${enable ? '1' : '0'}`);
  }

  async interfaceClear() {
    await this.writeToController('++ifc');
    await sleep(150); // Manual says 150 microseconds, but we can't sleep that short of time
  }

  async selectedDeviceClear(address?: number): Promise<void> {
    if (address) await this.setDeviceAddress(address);
    await this.writeToController('++clr');
  }

  async getEndOfInstruction(): Promise<boolean> {
    return await this.queryController('++eoi') === '1';
  }

  async setEndOfInstruction(enable: boolean): Promise<void> {
    await this.writeToController(`++eoi ${enable ? '1' : '0'}`);
  }

  async getEndOfTransmission(): Promise<EndOfTransmissionOptions> {
    const characterData = await this.queryController('++eot_char');
    const enabledData = await this.queryController('++eot_enable');
    return {
      character: parseInt(characterData),
      enabled: parseInt(enabledData) === 1
    };
  }

  async setEndOfTransmission(options: EndOfTransmissionOptions): Promise<void> {
    await this.writeToController(`++eot_char ${options.character}`);
    await this.writeToController(`++eot_enable ${options.enabled ? '1' : '0'}`);
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
    await this.writeToController('++rst');
    await sleep(6000);
  }

  async checkSRQ() {
    const data = await this.queryController('++srq');
    const srq = parseInt(data);
    return srq === 1;
  }

  async serialPoll(primaryAddress?: number, secondaryAddress?: number): Promise<StatusByteRegister> {
    let query = '++spoll'; // Use currently set address
    if (primaryAddress) query = `${query} ${primaryAddress}`; // Polls the primary address, but does not change the currently set address
    if (secondaryAddress) query = `${query} ${secondaryAddress}`; // Polls the primary and second address, but does not change the currently set address
    let valueString = await this.queryString(query);
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
