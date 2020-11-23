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
  private fReadTimoutTimerId?: NodeJS.Timeout;
  private fWriteTimoutTimerId?: NodeJS.Timeout;
  private fLastSetDeviceAddress?: number;
  private fLastSetTerminator?: EndOfStringTerminator;

  async onConnected() {
    this.fLastSetDeviceAddress = undefined;
    this.fLastSetTerminator = undefined;
    await super.onConnected();
    if (this.resetOnConnect) await this.reset();
    // const version = await this.getVersion();
    await this.setAutoReadAfterWrite(false);
    await this.writeString('++savecfg 0');
    await this.setMode(Mode.Controller);
    await this.setEndOfStringTerminator('Lf');
    await this.setEndOfInstruction(true);
    await this.writeString('++read_tmo_ms 3000');
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

  protected clearTimeouts() {
    if (this.fReadTimoutTimerId) clearTimeout(this.fReadTimoutTimerId);
    if (this.fWriteTimoutTimerId) clearTimeout(this.fWriteTimoutTimerId);
    this.fReadTimoutTimerId = undefined;
    this.fWriteTimoutTimerId = undefined;
  }

  write(data: ArrayBufferLike) {
    return new Promise<ArrayBufferLike>((resolve, reject) => {
      const returnResolve = (retVal?: ArrayBufferLike) => {
        this.clearTimeouts();
        return resolve(retVal);
      }
      const returnReject = (error: Error) => {
        this.clearTimeouts();
        this.onError(error);
        return reject(error);
      }
      try {
        if (this.isDisconnecting) return returnResolve();
        if (!this.duplexClient) {
          const err = new Error('Client is undefined');
          this.onError(err);
          return returnReject(err);
        }
        const dataStringWithoutTerminators = this.fTextDecoder.decode(data);
        const dataString = dataStringWithoutTerminators + '\n';
        this.fWriteTimoutTimerId = setTimeout(() => {
          const err = new Error(`Write timeout after ${this.readTimeout} ms`);
          return returnReject(err);
        }, this.readTimeout);
        this.duplexClient.write(dataString, async (writeErr) => {
          if (writeErr) return returnReject(writeErr);
          if (!this.duplexClient) {
            const err = new Error('Client is undefined');
            this.onError(err);
            return returnReject(err);
          }
          await this.onPrologixDataSent();
          log.info(`Write`, dataStringWithoutTerminators);
          const actualWroteData = new TextEncoder().encode(dataString);
          return returnResolve(actualWroteData);
        });
      } catch (error) {
        return returnReject(error);
      }
    });
  }

  read(): Promise<ArrayBufferLike> {
    return new Promise<ArrayBufferLike>(async (resolve, reject) => {
      const returnResolve = (retVal?: ArrayBufferLike) => {
        this.clearTimeouts();
        return resolve(retVal);
      }
      const returnReject = (error: Error) => {
        this.clearTimeouts();
        this.onError(error);
        return reject(error);
      }
      try {
        if (this.isDisconnecting) return returnResolve();
        if (!this.duplexClient || !this.isConnected) {
          const error = new Error('Not connected or client is undefined');
          return returnReject(error);
        };
        this.duplexClient.removeAllListeners('error');
        const handleData = (data: string) => {
          if (this.duplexClient) this.duplexClient.removeAllListeners('error');
          this.fReadlineParser.off('data', handleData);
          const retVal = this.fTextEncoder.encode(data);
          return returnResolve(retVal);
        }
        const handleError = (err: Error) => {
          if (this.duplexClient) this.duplexClient.removeAllListeners('error');
          this.fReadlineParser.off('data', handleData);
          return returnReject(err);
        }
        this.duplexClient.once('error', handleError);
        this.fReadlineParser.on('data', handleData);
        await this.writeString('++read eoi');
        this.fReadTimoutTimerId = setTimeout(() => {
          const err = new Error(`Read timeout after ${this.readTimeout} ms`);
          return returnReject(err);
        }, this.readTimeout);
      } catch (error) {
        return returnReject(error);
      }
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
      await this.writeString('++read');
    });
  }

  protected async queryController(query: string) {
    await this.writeString(query);
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
    if (this.fLastSetDeviceAddress && this.fLastSetDeviceAddress === address) return;
    this.fLastSetDeviceAddress = address;
    await this.writeString(`++addr ${address}`);
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
    if (this.fLastSetTerminator && this.fLastSetTerminator === eos) return;
    this.fLastSetTerminator = eos;
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
    return await this.queryController('++eoi') === '1';
  }

  async setEndOfInstruction(enable: boolean): Promise<void> {
    await this.writeString(`++eoi ${enable ? '1' : '0'}`);
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
