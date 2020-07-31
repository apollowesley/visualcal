import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../constants';

interface ProcedureCreatedCallback {
  (procedure: Procedure): void;
}

export class IpcManager extends EventEmitter {

  private fProcedureCreatedCallback: ProcedureCreatedCallback = () => {};

  constructor() {
    super();
    ipcRenderer.on(IpcChannels.procedures.create.response, (_, procedure: Procedure) => {
      this.fProcedureCreatedCallback(procedure);
    });
  }

  get onProcedureCreated() { return this.fProcedureCreatedCallback; }

  set onProcedureCreated(callback: ProcedureCreatedCallback) {
    this.fProcedureCreatedCallback = callback;
  };

}