import { CommunicationInterface } from './CommunicationInterface';
import electronLog from 'electron-log';

const log = electronLog.scope('EmulatedCommunicationInterface');

export class EmulatedCommunicationInterface extends CommunicationInterface {

  private isConnectedInternal: boolean = false;

  async onConnect(): Promise<void> {
    this.isConnectedInternal = true;
    return await Promise.resolve();
  }

  async onDisconnect(): Promise<void> {
    this.isConnectedInternal = false;
    await Promise.resolve();
  }

  get isConnected(): boolean {
    return this.isConnectedInternal;
  }

  protected getIsConnected() {
    return this.isConnectedInternal;
  }

  async read(): Promise<ArrayBufferLike> {
    return Promise.resolve(new TextEncoder().encode((Math.random() * 100.0).toString()));
  }

  async write(data: ArrayBufferLike) {
    const dataStringWithoutTerminators = new TextDecoder().decode(data);
    const dataString = dataStringWithoutTerminators + '\n';
    log.info(`Write`, dataStringWithoutTerminators);
    return Promise.resolve(data);
  } 

}
