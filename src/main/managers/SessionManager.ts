import { ipcMain } from 'electron';
import electronLog from 'electron-log';
import { TypedEmitter } from 'tiny-typed-emitter';
import { SessionViewWindowOpenIPCInfo } from '../../@types/session-view';
import { CommunicationInterfaceTypes, IpcChannels } from '../../constants';
import NodeRed from '../node-red';
import { getDeviceConfigurationNodeInfosForCurrentFlow } from '../node-red/utils';
import { UserManager } from './UserManager';

const log = electronLog.scope('SessionManager');
const nodeRed = NodeRed();

interface Events {
  activeChanged: (session?: Session) => void;
}

export class SessionManager extends TypedEmitter<Events> {

  private fUserManager: UserManager;

  constructor(userManager: UserManager) {
    super();
    this.fUserManager = userManager;
    this.fUserManager.on('activeSessionChanged', (session) => {
      this.emit('activeChanged', session);
      ipcMain.sendToAll(IpcChannels.session.active.changed, session);
    });
    this.initIpcEventHandlers();
    log.info('Loaded');
  }

  static SESSION_RESULTS_FOLDER_NAME = 'results';

  get all() {
    const activeUser = this.fUserManager.activeUser;
    if (!activeUser) return [];
    return activeUser.sessions ? activeUser.sessions : [];
  }

  getIsActive(name: string) {
    const active = this.fUserManager.activeSession;
    if (!active) return false;
    return active.name.toLocaleUpperCase() === name.toLocaleUpperCase();
  }

  getOne(name: string) {
    return this.all.find(s => s.name.toLocaleUpperCase() === name.toLocaleUpperCase());
  }

  getAllForUser(email: string) {
    return this.all.filter(s => s.username.toLocaleUpperCase() === email.toLocaleUpperCase());
  }

  removeAllForUser(email: string) {
    this.fUserManager.removeAllSessionsForUser(email);
  }

  update(session: Session) {
    this.fUserManager.updateSession(session);
  }

  private initIpcEventHandlers() {

    ipcMain.on(IpcChannels.session.getDeviceConfigurationNodeInfosForCurrentFlow.request, (event) => {
      try {
        const retVal = getDeviceConfigurationNodeInfosForCurrentFlow();
        event.reply(IpcChannels.session.getDeviceConfigurationNodeInfosForCurrentFlow.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.session.getDeviceConfigurationNodeInfosForCurrentFlow.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.viewInfo.request, async (event) => {
      if (!this.fUserManager.activeUser) {
        event.reply(IpcChannels.session.viewInfo.error, new Error('No active user'));
        return;
      }
      const activeSession = this.fUserManager.activeSession;
      if (!activeSession) {
        event.reply(IpcChannels.session.viewInfo.error, new Error('No active session'));
        return;
      }
      const procedure = await global.visualCal.procedureManager.getOne(activeSession.procedureName);
      if (!procedure) {
        event.reply(IpcChannels.session.viewInfo.error, new Error(`Procedure, ${activeSession.procedureName}, does not exist`));
        return;
      }
      const sections = nodeRed.visualCalSections;
      const deviceConfigurationNodeInfosForCurrentFlow = getDeviceConfigurationNodeInfosForCurrentFlow();
      const viewInfo: SessionViewWindowOpenIPCInfo = {
        user: this.fUserManager.activeUser,
        session: activeSession,
        procedure: procedure,
        sections: sections,
        benchConfig: this.fUserManager.activeBenchConfig ? this.fUserManager.activeBenchConfig : undefined,
        deviceNodes: deviceConfigurationNodeInfosForCurrentFlow
      };
      event.reply(IpcChannels.session.viewInfo.response, viewInfo);
    });
  }

}
