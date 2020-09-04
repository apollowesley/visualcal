import { ipcMain } from 'electron';
import electronStore from 'electron-cfg';
import electronLog from 'electron-log';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels } from '../../constants';

const log = electronLog.scope('BenchConfigManager');

interface Events {
  activeChanged: (config?: BenchConfig) => void;
}

interface Store {
  active: string;
  configs: BenchConfig[];
}

export class BenchConfigManager extends TypedEmitter<Events> {

  private fStore: electronStore<Store> = electronStore.create<Store>('bench-configurations.json', log);

  constructor() {
    super();
    this.verifyActiveExistsAndClearIfNot();
    this.fStore.observe('active', async () => {
      const active = this.active;
      ipcMain.sendToAll(IpcChannels.session.active.changed, active);
      this.emit('activeChanged', active ? active : undefined);
    });
    this.initIpcEventHandlers();
    log.info('Loaded');
  }

  get all() { return this.fStore.get('configs', []); }

  get active() {
    const activeSession = this.all.find(s => s.name.toLocaleUpperCase() === this.fStore.get('active', '').toLocaleUpperCase());
    if (!activeSession) return null;
    return activeSession;
  }
  set active(config: BenchConfig | null) {
    if (config) {
      this.fStore.set('active', config.name);
    } else {
      this.fStore.delete('active');
    }
  }

  private verifyActiveExistsAndClearIfNot() {
    const activeUser = this.active;
    if (!activeUser) this.fStore.delete('active');
  }

  getIsActive(name: string) {
    const active = this.active;
    if (!active) return false;
    return active.name.toLocaleUpperCase() === name.toLocaleUpperCase();
  }

  getOne(name: string) {
    return this.all.find(s => s.name.toLocaleUpperCase() === name.toLocaleUpperCase());
  }

  getAllForSession(sessionName: string) {
    return this.all.filter(s => s.username.toLocaleUpperCase() === sessionName.toLocaleUpperCase());
  }

  add(config: BenchConfig) {
    const existing = this.getOne(config.name);
    if (existing) throw new Error(`Bench configuration, ${config.name}, already exists.`);
  }

  update(config: BenchConfig) {
    const configs = this.all;
    const existingIndex = configs.findIndex(c => c.name.toLocaleUpperCase() === config.name.toLocaleUpperCase());
    if (existingIndex < 0) throw new Error(`Bench configuration, ${config.name}, does not exist`);
    configs.splice(existingIndex, 1, config);
    this.fStore.set('configs', configs);
  }

  removeAllForSession(sessionName: string) {
    const allForUser = this.getAllForSession(sessionName);
    const configs = this.all;
    let wasActiveDeleted = false;
    for (const config of allForUser) {
      const index = configs.findIndex(c => c.name.toLocaleUpperCase() === sessionName.toLocaleUpperCase());
      if (index < 0) continue;
      if (this.getIsActive(config.name)) wasActiveDeleted = true;
      configs.splice(index, 1);
    }
    this.fStore.set('configs', configs);
    if (wasActiveDeleted) this.active = null;
  }

  removeAllForSessions(sessionNames: string[]) {

  }

  private initIpcEventHandlers() {
    // Get all request
    ipcMain.on(IpcChannels.benchConfig.getAllForSession.request, (event, sessionName: string) => {
      try {
        const all = this.getAllForSession(sessionName);
        event.reply(IpcChannels.benchConfig.getAllForSession.response, all);
      } catch (error) {
        event.reply(IpcChannels.benchConfig.getAllForSession.error, error);
      }
    });
    // Save request
    ipcMain.on(IpcChannels.benchConfig.save.request, (event, config: BenchConfig) => {
      try {
        this.add(config);
        event.reply(IpcChannels.benchConfig.save.response, config);
      } catch (error) {
        event.reply(IpcChannels.benchConfig.save.error, error);
      }
    });
  }

}
