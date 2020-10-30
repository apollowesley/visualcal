import { ipcRenderer } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels } from '../../constants';

interface Events {
  interfaceConnecting: (info: { interfaceName: string }) => void;
  interfaceConnected: (info: { interfaceName: string, err?: Error }) => void;
  interfaceDisconnecting: (info: { interfaceName: string, err?: Error }) => void;
  interfaceDisconnected: (info: { interfaceName: string, err?: Error }) => void;
  interfaceDataReceived: (info: { interfaceName: string, data: ArrayBuffer }) => void;
  interfaceStringReceived: (info: { interfaceName: string, data: string }) => void;
  interfaceError: (info: { interfaceName: string, err: Error }) => void;
  interfaceAdded: (info: { interfaceName: string }) => void;
  interfaceRemoved: (info: { interfaceName: string }) => void;
  interfaceBeforeWrite: (info: { interfaceName: string, data: ArrayBuffer }) => void;
  interfaceAfterWrite: (info: { interfaceName: string, data: ArrayBuffer }) => void;
}

export class CommunicationInterfaceManager extends TypedEmitter<Events> {

  constructor() {
    super();
    ipcRenderer.on(IpcChannels.communicationInterface.added, (_, info: { interfaceName: string }) => this.emit('interfaceAdded', info));
    ipcRenderer.on(IpcChannels.communicationInterface.removed, (_, info: { interfaceName: string }) => this.emit('interfaceRemoved', info));

    ipcRenderer.on(IpcChannels.communicationInterface.connected, (_, info: { interfaceName: string, err?: Error }) => this.emit('interfaceConnected', info));
    ipcRenderer.on(IpcChannels.communicationInterface.connecting, (_, info: { interfaceName: string }) => this.emit('interfaceConnecting', info));

    ipcRenderer.on(IpcChannels.communicationInterface.disconnecting, (_, info: { interfaceName: string, err?: Error }) => this.emit('interfaceDisconnecting', info));
    ipcRenderer.on(IpcChannels.communicationInterface.disconnected, (_, info: { interfaceName: string, err?: Error }) => this.emit('interfaceDisconnected', info));

    ipcRenderer.on(IpcChannels.communicationInterface.error, (_, info: { interfaceName: string, err: Error }) => this.emit('interfaceError', info));

    ipcRenderer.on(IpcChannels.communicationInterface.dataReceived, (_, info: { interfaceName: string, data: ArrayBuffer }) => this.emit('interfaceDataReceived', info));
    ipcRenderer.on(IpcChannels.communicationInterface.stringReceived, (_, info: { interfaceName: string, data: string }) => this.emit('interfaceStringReceived', info));

    ipcRenderer.on(IpcChannels.communicationInterface.beforeWrite, (_, info: { interfaceName: string, data: ArrayBuffer }) => this.emit('interfaceBeforeWrite', info));
    ipcRenderer.on(IpcChannels.communicationInterface.afterWrite, (_, info: { interfaceName: string, data: ArrayBuffer }) => this.emit('interfaceAfterWrite', info));
  }

}
