import { EventEmitter } from 'events';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { IpcChannelCRUD } from '../../constants';

interface RendererCRUDManagerType<TCreate extends NamedType, TItem extends NamedType> extends EventEmitter {
  getAll(): void;
  getOne(name: string): void;
  create(info: TCreate): void;
  remove(name: string): void;
  getExists(name: string): void;
  rename(oldName: string, newName: string): void;
  getActive(): void;
  setActive(name: string): void;
  update(item: TItem): void;
}

interface ResponseArgs {
  event: IpcRendererEvent;
}

export interface ErrorResponseArgs extends ResponseArgs {
  error: Error;
}

export interface GetAllResponseArgs<TItem> extends ResponseArgs {
  items: TItem[];
}

export abstract class RendererCRUDManager<TCreate extends NamedType, TCreated extends NamedType, TItem extends NamedType> extends EventEmitter implements RendererCRUDManagerType<TCreate, TItem> {

  private fChannelNames: IpcChannelCRUD;

  constructor(channelNames: IpcChannelCRUD) {
    super();
    this.fChannelNames = channelNames;

    ipcRenderer.on(this.fChannelNames.getAll.response, (event, items: TItem[]) => this.emit(this.fChannelNames.getAll.response, { event, items }));
    ipcRenderer.on(this.fChannelNames.getAll.error, (event, error) => this.emit(this.fChannelNames.getAll.error, { event, error }));

    ipcRenderer.on(this.fChannelNames.getOne.response, (event, item: TItem | undefined) => this.emit(this.fChannelNames.getOne.response, { event, item }));
    ipcRenderer.on(this.fChannelNames.getOne.error, (event, error) => this.emit(this.fChannelNames.getOne.error, { event, error }));

    ipcRenderer.on(this.fChannelNames.create.response, (event, item: TCreated) => this.emit(this.fChannelNames.create.response, { event, item }));
    ipcRenderer.on(this.fChannelNames.create.error, (event, error) => this.emit(this.fChannelNames.create.error, { event: event, error: error }));

    ipcRenderer.on(this.fChannelNames.remove.response, (event, name: string) => this.emit(this.fChannelNames.remove.response, { event, name }));
    ipcRenderer.on(this.fChannelNames.remove.error, (event, error) => this.emit(this.fChannelNames.remove.error, { event, error }));

    ipcRenderer.on(this.fChannelNames.rename.response, (event, oldName: string, newName: string) => this.emit(this.fChannelNames.rename.response, { event, oldName, newName }));
    ipcRenderer.on(this.fChannelNames.rename.error, (event, error) => this.emit(this.fChannelNames.rename.error, { event, error }));

    ipcRenderer.on(this.fChannelNames.getActive.response, (event, name: string) => this.emit(this.fChannelNames.getActive.response, { event, name }));
    ipcRenderer.on(this.fChannelNames.getActive.error, (event, error) => this.emit(this.fChannelNames.getActive.error, { event, error }));

    ipcRenderer.on(this.fChannelNames.setActive.response, (event, name: string) => this.emit(this.fChannelNames.setActive.response, { event, name }));
    ipcRenderer.on(this.fChannelNames.setActive.error, (event, error) => this.emit(this.fChannelNames.setActive.error, { event, error }));

    ipcRenderer.on(this.fChannelNames.update.response, (event, item: TItem) => this.emit(this.fChannelNames.update.response, { event, item }));
    ipcRenderer.on(this.fChannelNames.update.error, (event, error) => this.emit(this.fChannelNames.update.error, { event, error }));
  }

  getAll(): void {
    window.visualCal.log.info('Getting all');
    ipcRenderer.send(this.fChannelNames.getAll.request);
  }

  getOne(name: string): void {
    window.visualCal.log.info('Getting one', name);
    ipcRenderer.send(this.fChannelNames.getOne.request, name);
  }

  create(info: TCreate): void {
    window.visualCal.log.info('Creating', info);
    ipcRenderer.send(this.fChannelNames.create.request, info);
  }

  remove(name: string): void {
    window.visualCal.log.info('Renaming', name);
    ipcRenderer.send(this.fChannelNames.remove.request, name);
  }

  getExists(name: string): void {
    window.visualCal.log.info('Getting exists', name);
    ipcRenderer.send(this.fChannelNames.getExists.request, name);
  }

  rename(oldName: string, newName: string): void {
    window.visualCal.log.info('Renaming', oldName, newName);
    ipcRenderer.send(this.fChannelNames.rename.request, oldName, newName);
  }

  getActive(): void {
    window.visualCal.log.info('Getting active');
    ipcRenderer.send(this.fChannelNames.getActive.request);
  }

  setActive(name: string): void {
    window.visualCal.log.info('Setting active', name);
    ipcRenderer.send(this.fChannelNames.setActive.request, name);
  }

  update(item: TItem): void {
    window.visualCal.log.info('Updating', item);
    ipcRenderer.send(this.fChannelNames.update.request, item);
  }

}
