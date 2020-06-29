import { EventEmitter } from 'events';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { IpcChannels } from '../../@types/constants';

export interface RendererProcedureManagerType extends EventEmitter {
  getAll(): void;
  getOne(name: string): void;
  create(info: CreateProcedureInfo): void;
  remove(name: string): void;
  getExists(name: string): void;
  rename(oldName: string, newName: string): void;
  getActive(): void;
  setActive(name: string): void;
}

export interface ResponseArgs {
  event: IpcRendererEvent;
}

export interface ErrorResponseArgs extends ResponseArgs {
  error: Error;
}

export interface GetAllResponseArgs extends ResponseArgs {
  procedures: Procedure[];
}

export interface GetOneResponseArgs extends ResponseArgs {
  procedure: Procedure;
}

export interface CreateResponseArgs extends ResponseArgs {
  procedure: CreatedProcedureInfo;
}

export interface RemoveResponseArgs extends ResponseArgs {
  name: string;
}

export interface RenameResponseArgs extends ResponseArgs {
  oldName: string;
  newName: string;
}

export interface GetActiveResponseArgs extends ResponseArgs {
  name: string;
}

export interface SetActiveResponseArgs extends ResponseArgs {
  name: string;
}

export interface Response<T extends ResponseArgs> {
  (args: T): void;
}

export class RendererProcedureManager extends EventEmitter implements RendererProcedureManagerType {


  constructor() {
    super();
    console.info(ipcRenderer.listenerCount(IpcChannels.procedures.getAll.response));
    ipcRenderer.on(IpcChannels.procedures.getAll.response, (event, procedures: Procedure[]) => this.emit(IpcChannels.procedures.getAll.response, { event: event, procedures: procedures }));
    ipcRenderer.on(IpcChannels.procedures.getAll.error, (event, error) => this.emit(IpcChannels.procedures.getAll.error, { event: event, error: error }));

    ipcRenderer.on(IpcChannels.procedures.getOne.response, (event, procedure: Procedure | undefined) => this.emit(IpcChannels.procedures.getOne.response, { event: event, procedure: procedure }));
    ipcRenderer.on(IpcChannels.procedures.getOne.error, (event, error) => this.emit(IpcChannels.procedures.getOne.error, { event: event, error: error }));

    ipcRenderer.on(IpcChannels.procedures.create.response, (event, procedure: CreatedProcedureInfo) => this.emit(IpcChannels.procedures.create.response, { event: event, procedure: procedure }));
    ipcRenderer.on(IpcChannels.procedures.create.error, (event, error) => this.emit(IpcChannels.procedures.create.error, { event: event, error: error }));

    ipcRenderer.on(IpcChannels.procedures.remove.response, (event, name: string) => this.emit(IpcChannels.procedures.remove.response, { event: event, name: name }));
    ipcRenderer.on(IpcChannels.procedures.remove.error, (event, error) => this.emit(IpcChannels.procedures.remove.error, { event: event, error: error }));

    ipcRenderer.on(IpcChannels.procedures.rename.response, (event, oldName: string, newName: string) => this.emit(IpcChannels.procedures.rename.response, { event: event, oldName: oldName, newName: newName }));
    ipcRenderer.on(IpcChannels.procedures.rename.error, (event, error) => this.emit(IpcChannels.procedures.rename.error, { event: event, error: error }));

    ipcRenderer.on(IpcChannels.procedures.getActive.response, (event, name: string) => this.emit(IpcChannels.procedures.getActive.response, { event: event, name: name }));
    ipcRenderer.on(IpcChannels.procedures.getActive.error, (event, error) => this.emit(IpcChannels.procedures.getActive.error, { event: event, error: error }));

    ipcRenderer.on(IpcChannels.procedures.setActive.response, (event, name: string) => this.emit(IpcChannels.procedures.setActive.response, { event: event, name: name }));
    ipcRenderer.on(IpcChannels.procedures.setActive.error, (event, error) => this.emit(IpcChannels.procedures.setActive.error, { event: event, error: error }));
  }

  getAll(): void {
    ipcRenderer.send(IpcChannels.procedures.getAll.request);
  }

  getOne(name: string): void {
    ipcRenderer.send(IpcChannels.procedures.getOne.request, name);
  }

  create(info: CreateProcedureInfo): void {
    window.visualCal.log.info('Creating procedure');
    ipcRenderer.send(IpcChannels.procedures.create.request, info);
  }

  remove(name: string): void {
    ipcRenderer.send(IpcChannels.procedures.remove.request, name);
  }

  getExists(name: string): void {
    ipcRenderer.send(IpcChannels.procedures.getExists.request, name);
  }

  rename(oldName: string, newName: string): void {
    ipcRenderer.send(IpcChannels.procedures.rename.request, oldName, newName);
  }

  getActive(): void {
    ipcRenderer.send(IpcChannels.procedures.getActive.request);
  }

  setActive(name: string): void {
    ipcRenderer.send(IpcChannels.procedures.setActive.request, name);
  }

}