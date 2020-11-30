import { ipcRenderer } from 'electron';
import Tabulator from 'tabulator-tables';
import { TypedEmitter } from 'tiny-typed-emitter';
import { v4 as uuid } from 'uuid';
import { LogEntry } from 'visualcal-common/dist/result';
import { HardwareIpcChannels } from '../../../../constants';

interface ConstructorOptions {
  tableElemenetId: string;
  ipcChannels: HardwareIpcChannels;
}

interface Events {
  added: (name: string) => void;
  removed: (name: string) => void;
  connecting: (name: string) => void;
  connected: (name: string) => void;
  disconnecting: (name: string) => void;
  disconnected: (name: string) => void;
  error: (name: string, error: Error) => void;
  dataReceived: (name: string, data: ArrayBufferLike) => void;
  stringReceived: (name: string, data: string) => void;
  beforeWrite: (name: string, data: ArrayBufferLike) => void;
  afterWrite: (name: string, data: ArrayBufferLike) => void;
  entryAdded: (entry: LogEntry) => void;
}

export class LogHandler extends TypedEmitter<Events> {

  private fTable: Tabulator;
  private fTextDecoder = new TextDecoder();

  constructor(opts: ConstructorOptions) {
    super();
    this.fTable = new Tabulator(`#${opts.tableElemenetId}`, {
      data: [],
      layout: 'fitDataStretch',
      height: '90%',
      columns: [
        { title: 'Timestamp', field: 'timestamp', formatter: 'datetime' },
        { title: 'Name', field: 'name' },
        { title: 'Type', field: 'type' },
        { title: 'Data / Command / Message', field: 'message' }
      ]
    });

    // ==============================
    // ========= Interface ==========
    // ==============================

    if (opts.ipcChannels.added) {
      ipcRenderer.on(opts.ipcChannels.added, (_, info: { name: string; }) => {
        this.add({
          name: info.name,
          type: 'Added'
        });
        this.emit('added', info.name);
      });
    }

    if (opts.ipcChannels.removed) {
      ipcRenderer.on(opts.ipcChannels.removed, (_, info: { name: string; }) => {
        this.add({
          name: info.name,
          type: 'Removed'
        });
        this.emit('removed', info.name);
      });
    }

    if (opts.ipcChannels.connecting) {
      ipcRenderer.on(opts.ipcChannels.connecting, (_, info: { name: string; }) => {
        this.add({
          name: info.name,
          type: 'Connecting'
        });
        this.emit('connecting', info.name);
      });
    }

    if (opts.ipcChannels.connected) {
      ipcRenderer.on(opts.ipcChannels.connected, (_, info: { name: string; }) => {
        this.add({
          name: info.name,
          type: 'Connected'
        });
        this.emit('connected', info.name);
      });
    }

    if (opts.ipcChannels.disconnecting) {
      ipcRenderer.on(opts.ipcChannels.disconnecting, (_, info: { name: string; }) => {
        this.add({
          name: info.name,
          type: 'Disconnecting'
        });
        this.emit('disconnecting', info.name);
      });
    }

    if (opts.ipcChannels.disconnected) {
      ipcRenderer.on(opts.ipcChannels.disconnected, (_, info: { name: string; }) => {
        this.add({
          name: info.name,
          type: 'Disconnected'
        });
        this.emit('disconnected', info.name);
      });
    }

    ipcRenderer.on(opts.ipcChannels.error, (_, info: { name: string, error: Error; }) => {
      this.add({
        name: info.name,
        type: 'Error',
        message: info.error.message
      });
      this.emit('error', info.name, info.error);
    });

    ipcRenderer.on(opts.ipcChannels.dataReceived, (_, info: { name: string, data: ArrayBuffer; }) => {
      this.add({
        name: info.name,
        type: 'Data received (Byte array)',
        message: info.data.toString()
      });
      this.add({
        name: info.name,
        type: 'Data received (String)',
        message: this.fTextDecoder.decode(info.data)
      });
      this.emit('dataReceived', info.name, info.data);
    });

    ipcRenderer.on(opts.ipcChannels.beforeWrite, (_, info: { name: string, data: ArrayBuffer; }) => {
      this.add({
        name: info.name,
        type: 'Before write (Byte array)',
        message: info.data.toString()
      });
      this.add({
        name: info.name,
        type: 'Before write (String)',
        message: this.fTextDecoder.decode(info.data)
      });
      this.emit('beforeWrite', info.name, info.data);
    });

    ipcRenderer.on(opts.ipcChannels.afterWrite, (_, info: { name: string, data: ArrayBuffer; }) => {
      this.add({
        name: info.name,
        type: 'After write (Byte array)',
        message: info.data.toString()
      });
      this.add({
        name: info.name,
        type: 'After write (String)',
        message: this.fTextDecoder.decode(info.data)
      });
      this.emit('afterWrite', info.name, info.data);
    });
  }

  clear() {
    this.fTable.clearData();
  }

  async add(entry: LogEntry) {
    entry.id = uuid();
    entry.timestamp = new Date();
    const row = await this.fTable.addRow(entry);
    await row.scrollTo();
    this.emit('entryAdded', entry);
  }

}
