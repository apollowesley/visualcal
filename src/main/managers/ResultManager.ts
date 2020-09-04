import { EventEmitter } from 'events';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { IpcChannels } from '../../constants';
import { ipcMain } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import electronLog from 'electron-log';
import electronStore from 'electron-cfg';

interface Events {
  resultAdded: (result: LogicResult) => void;
  resultsAdded: (results: LogicResult[]) => void;
}

interface Store {
  results: LogicResult[];
}

const log = electronLog.scope('ResultManager');

export class ResultManager extends TypedEmitter<Events> {

  private fStore: electronStore<Store> = electronStore.create<Store>('results.json', log);
  private fResults: LogicResult[];

  constructor() {
    super();
    this.fResults = this.fStore.get('results', []);
    ipcMain.on(IpcChannels.results.load.request, async (event, sessionName: string) => {
      try {
        const retVal = await this.getResultsForSession(sessionName);
        event.reply(IpcChannels.results.load.response, sessionName, retVal);
      } catch (error) {
        event.reply(IpcChannels.results.load.error, error);
      }
    });

    ipcMain.on(IpcChannels.results.save.request, (event, sessionName: string, results: LogicResult[]) => {
      try {
        this.save(sessionName, results);
        event.reply(IpcChannels.results.save.response, sessionName, results);
      } catch (error) {
        event.reply(IpcChannels.results.save.error, error);
      }
    });

    ipcMain.on(IpcChannels.results.saveOne.request, (event, sessionName: string, result: LogicResult) => {
      try {
        this.saveOne(sessionName, result);
        event.reply(IpcChannels.results.saveOne.response, sessionName, result);
      } catch (error) {
        event.reply(IpcChannels.results.saveOne.error, error);
      }
    });
    log.info('Loaded');
  }

  async getResultsForSession(sessionName: string) {
    return this.fResults.filter(r => r.sessionId.toLocaleUpperCase() === sessionName.toLocaleUpperCase());
  }

  save(sessionName: string, results: LogicResult[]) {
    results.forEach(r => {
      r.sessionId = sessionName;
      this.fResults.push(r);
    });
    this.fStore.set('results', this.fResults);
    ipcMain.sendToAll(IpcChannels.results.save.response, results);
    this.emit('resultsAdded', results);
  }

  saveOne(sessionName: string, result: LogicResult) {
    result.sessionId = sessionName;
    this.fResults.push(result);
    this.fStore.set('results', this.fResults);
    ipcMain.sendToAll(IpcChannels.results.saveOne.response, result);
    this.emit('resultAdded', result);
  }

}
