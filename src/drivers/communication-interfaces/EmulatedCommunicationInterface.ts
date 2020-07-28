import { CommunicationInterface } from './CommunicationInterface';

export class EmulatedCommunicationInterface extends CommunicationInterface {

  private isConnectedInternal: boolean = false;

  async connect(): Promise<void> {
    this.onConnecting();
    this.isConnectedInternal = true;
    await this.onConnected();
    return Promise.resolve();
  }

  disconnect(): void {
    this.isConnectedInternal = false;
  }

  get isConnected(): boolean {
    return this.isConnectedInternal;
  }

  protected write(data: ArrayBuffer): Promise<void> {
    return Promise.resolve();
  } 

  async queryString(data: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return Promise.resolve((Math.random() * 100.0).toString());
  }

}
