import { CommunicationInterface } from './CommunicationInterface';

export class EmulatedCommunicationInterface extends CommunicationInterface {

  private isConnectedInternal: boolean = false;

  get manufacturerModelType(): CommunicationInterfaceManufacturerModelType {
    return {
      manufacturer: 'IndySoft',
      model: 'Emulated',
      type: 'Emulated'
    }
  }

  async connect(): Promise<void> {
    this.onConnecting();
    this.isConnectedInternal = true;
    await this.onConnected();
    await Promise.resolve();
  }

  disconnect(): void {
    this.isConnectedInternal = false;
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
