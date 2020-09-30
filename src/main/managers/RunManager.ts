import { TypedEmitter } from 'tiny-typed-emitter';
import { v4 as uuid } from 'uuid';
import electronStore from 'electron-cfg';
import electronLog from 'electron-log';
import { ipcMain } from 'electron';
import { IpcChannels, LogicResult, LogicRun, LogicRunBasicInfo } from 'visualcal-common/dist/result';

interface Events {
  temp: () => void;
}

interface Store {
  runs: LogicRun<string, number>[];
}

const log = electronLog.scope('RunManager');

export class RunManager extends TypedEmitter<Events> {

  private static fInstance = new RunManager();
  public static get instance() { return RunManager.fInstance; }

  private fStore: electronStore<Store> = electronStore.create<Store>('runs.json', log);

  get runs() { return this.fStore.get('runs', []); }

  private constructor() {
    super();
    this.initIpcHandlers();
    log.info('Loaded');
  }

  getOne(runId: string) {
    const runs = this.runs;
    const run = runs.find(r => r.id.toLocaleUpperCase() === runId.toLocaleUpperCase());
    return run;
  }

  setOne(run: LogicRun<string, number>) {
    const runs = this.runs;
    const existingRunIndex = runs.findIndex(r => r.id.toLocaleUpperCase() === run.id.toLocaleUpperCase());
    if (existingRunIndex < 0) {
      runs.push(run);
    } else {
      runs.splice(existingRunIndex, 1, run);
    }
    this.fStore.set('runs', runs);
  }

  getAllRunInfos(): LogicRunBasicInfo[] {
    const runs = this.runs;
    const retVal = runs.map(r => {
      const basicRunInfo: LogicRunBasicInfo = { id: r.id,
        sessionId: r.sessionId,
        sectionId: r.sectionId,
        actionId: r.actionId,
        description: r.description,
        startTimestamp: r.startTimestamp,
        stopTimestamp: r.stopTimestamp,
        notes: r.notes
      };
      return basicRunInfo;
    });
    return retVal;
  }

  removeOne(runId: string) {
    const runs = this.runs;
    const existingRunIndex = runs.findIndex(r => r.id.toLocaleUpperCase() === runId.toLocaleUpperCase());
    if (existingRunIndex < 0) return;
    runs.splice(existingRunIndex, 1);
    this.fStore.set('runs', runs);
  }

  startRun(sessionId: string, sectionId: string, actionId: string, description?: string) {
    const run: LogicRun<string, number> = {
      id: uuid(),
      sessionId: sessionId,
      sectionId: sectionId,
      actionId: actionId,
      startTimestamp: new Date(),
      description: description ? description : new Date().toDateString(),
      results: []
    }
    this.setOne(run);
    ipcMain.sendToAll(IpcChannels.runStarted, run);
    return run;
  }

  stopRun(runId: string) {
    const run = this.getOne(runId);
    if (!run) throw new Error(`Run with Id, ${runId}, does not exist`);
    run.stopTimestamp = new Date();
    this.setOne(run);
    ipcMain.sendToAll(IpcChannels.runStopped, run.id);
  }

  addResult(runId: string, result: LogicResult<string, number>) {
    const run = this.getOne(runId);
    if (!run) throw new Error(`Run with Id, ${runId}, does not exist`);
    run.results.push(result);
    this.setOne(run);
    ipcMain.sendToAll(IpcChannels.resultAdded, { result });

  }

  private initIpcHandlers() {
    ipcMain.on(IpcChannels.getAllBasicInfosForCurrentSession.request, (event) => {
      try {
        if (event.sender.isDestroyed()) return;
        const currentSession = global.visualCal.userManager.activeSession;
        if (!currentSession) return event.reply(IpcChannels.getAllBasicInfosForCurrentSession.error, 'No active session');
        const retVal = this.getAllRunInfos().map(r => r.sessionId === currentSession.name);
        event.reply(IpcChannels.getAllBasicInfosForCurrentSession.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.getAllBasicInfosForCurrentSession.error, error);
      }
    });

    ipcMain.on(IpcChannels.getResultsForRun.request, (event, runId: string) => {
      try {
        if (event.sender.isDestroyed()) return;
        const retVal = this.runs.map(r => r.id.toLocaleUpperCase() === runId.toLocaleUpperCase());
        event.reply(IpcChannels.getResultsForRun.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.getResultsForRun.error, error);
      }
    });
  }

}
