import { CommunicationInterface } from './CommunicationInterface';

export class EmulatedCommunicationInterface extends CommunicationInterface {

  private isConnectedInternal: boolean = false;

  connect(): Promise<void> {
    this.isConnectedInternal = true;
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
