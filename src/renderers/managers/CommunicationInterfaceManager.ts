import { ipcRenderer } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels } from '../../@types/constants';

interface Events {
  interfaceConnecting: (name: string) => void;
  interfaceConnected: (name: string, err?: Error) => void;
  interfaceDisconnected: (name: string, err?: Error) => void;
  interfaceDataReceived: (name: string, data: ArrayBuffer) => void;
  interfaceStringReceived: (name: string, data: string) => void;
  interfaceError: (name: string, err: Error) => void;
  interfaceAdded: (name: string) => void;
  interfaceRemoved: (name: string) => void;
}

export class CommunicationInterfaceManager extends TypedEmitter<Events> {

  constructor() {
    super();
    ipcRenderer.on(IpcChannels.communicationInterface.added, (_, name: string) => this.emit('interfaceAdded', name));
    ipcRenderer.on(IpcChannels.communicationInterface.removed, (_, name: string) => this.emit('interfaceRemoved', name));

    ipcRenderer.on(IpcChannels.communicationInterface.connected, (_, name: string, err?: Error) => this.emit('interfaceConnected', name, err));
    ipcRenderer.on(IpcChannels.communicationInterface.connecting, (_, name: string) => this.emit('interfaceConnecting', name));
    ipcRenderer.on(IpcChannels.communicationInterface.disconnected, (_, name: string, err?: Error) => this.emit('interfaceDisconnected', name, err));

    ipcRenderer.on(IpcChannels.communicationInterface.error, (_, name: string, err: Error) => this.emit('interfaceError', name, err));

    ipcRenderer.on(IpcChannels.communicationInterface.dataReceived, (_, name: string, data: ArrayBuffer) => this.emit('interfaceDataReceived', name, data));
    ipcRenderer.on(IpcChannels.communicationInterface.stringReceived, (_, name: string, data: string) => this.emit('interfaceStringReceived', name, data));
  }

}
