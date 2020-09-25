import { CommunicationInterface } from './CommunicationInterface';

export class EmulatedCommunicationInterface extends CommunicationInterface {

  private isConnectedInternal: boolean = false;

  async onConnect(): Promise<void> {
    await Promise.resolve();
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

  async write(data: ArrayBuffer): Promise<void> {
    await Promise.resolve();
  } 

}
