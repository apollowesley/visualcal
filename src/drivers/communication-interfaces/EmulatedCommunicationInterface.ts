import { CommunicationInterface } from './CommunicationInterface';

export class EmulatedCommunicationInterface extends CommunicationInterface {

  private isConnectedInternal: boolean = false;

  async onConnect(): Promise<void> {
    await Promise.resolve();
  }

  async onDisconnect(): Promise<void> {
    await Promise.resolve();
  }

  get isConnected(): boolean {
    return this.isConnectedInternal;
  }

  protected async write(data: ArrayBuffer): Promise<void> {
    await Promise.resolve();
  } 

  async queryString(data: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return await Promise.resolve((Math.random() * 100.0).toString());
  }

}
