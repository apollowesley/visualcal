import { Device } from './Device';
import { DeviceDefinition } from './device-interfaces';
import { CommunicationInterface } from '../communication-interfaces/CommunicationInterface';

export abstract class ControllableDevice extends Device implements IControllableDevice {

  protected communicationInterface: CommunicationInterface | null;

  protected constructor(definition: DeviceDefinition) {
    super(definition);
    this.communicationInterface = null;
  }

  getCommunicationInterface() { return this.communicationInterface; }
  setCommunicationInterface(communicationInterface: ICommunicationInterface) {
    this.communicationInterface = communicationInterface as CommunicationInterface;
  }

}
