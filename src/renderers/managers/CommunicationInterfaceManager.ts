import { ipcRenderer } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels } from '../../constants';

interface Events {
  interfaceConnecting: (info: { name: string }) => void;
  interfaceConnected: (info: { name: string, err?: Error }) => void;
  interfaceDisconnecting: (info: { name: string, err?: Error }) => void;
  interfaceDisconnected: (info: { name: string, err?: Error }) => void;
  interfaceDataReceived: (info: { name: string, data: ArrayBuffer }) => void;
  interfaceStringReceived: (info: { name: string, data: string }) => void;
  interfaceError: (info: { name: string, err: Error }) => void;
  interfaceAdded: (info: { name: string }) => void;
  interfaceRemoved: (info: { name: string }) => void;
  interfaceBeforeWrite: (info: { name: string, data: ArrayBuffer }) => void;
  interfaceAfterWrite: (info: { name: string, data: ArrayBuffer }) => void;
}

export class CommunicationInterfaceManager extends TypedEmitter<Events> {

  constructor() {
    super();
    ipcRenderer.on(IpcChannels.communicationInterface.added, (_, info: { name: string }) => this.emit('interfaceAdded', info));
    ipcRenderer.on(IpcChannels.communicationInterface.removed, (_, info: { name: string }) => this.emit('interfaceRemoved', info));

    ipcRenderer.on(IpcChannels.communicationInterface.connected, (_, info: { name: string, err?: Error }) => this.emit('interfaceConnected', info));
    ipcRenderer.on(IpcChannels.communicationInterface.connecting, (_, info: { name: string }) => this.emit('interfaceConnecting', info));

    ipcRenderer.on(IpcChannels.communicationInterface.disconnecting, (_, info: { name: string, err?: Error }) => this.emit('interfaceDisconnecting', info));
    ipcRenderer.on(IpcChannels.communicationInterface.disconnected, (_, info: { name: string, err?: Error }) => this.emit('interfaceDisconnected', info));

    ipcRenderer.on(IpcChannels.communicationInterface.error, (_, info: { name: string, err: Error }) => this.emit('interfaceError', info));

    ipcRenderer.on(IpcChannels.communicationInterface.dataReceived, (_, info: { name: string, data: ArrayBuffer }) => this.emit('interfaceDataReceived', info));
    ipcRenderer.on(IpcChannels.communicationInterface.stringReceived, (_, info: { name: string, data: string }) => this.emit('interfaceStringReceived', info));

    ipcRenderer.on(IpcChannels.communicationInterface.beforeWrite, (_, info: { name: string, data: ArrayBuffer }) => this.emit('interfaceBeforeWrite', info));
    ipcRenderer.on(IpcChannels.communicationInterface.afterWrite, (_, info: { name: string, data: ArrayBuffer }) => this.emit('interfaceAfterWrite', info));
  }

}
