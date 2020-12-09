import { ipcMain } from 'electron';
import electronLog from 'electron-log';
import { TypedEmitter } from 'tiny-typed-emitter';
import { SessionViewWindowOpenIPCInfo } from '../../@types/session-view';
import { IpcChannels } from '../../constants';
import { NodeRedManager } from './NodeRedManager';
import { UserManager } from './UserManager';
import { SessionForCreate } from 'visualcal-common/dist/session';
import { ConfigurationProperties as IndySoftInstrumentDriverConfigurationEditorNode } from '../../nodes/indysoft-instrument-driver-configuration-types';

const log = electronLog.scope('SessionManager');

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

  setActive(email: string, name: string, procedureName: string) {
    const session = this.fUserManager.getSession(email, name, procedureName);
    if (!session) throw new Error(`Session, ${name}, does not exist for user, ${email}`);
    this.fUserManager.activeSession = session;
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
        event.reply(IpcChannels.session.getDeviceConfigurationNodeInfosForCurrentFlow.response, []);
      } catch (error) {
        event.reply(IpcChannels.session.getDeviceConfigurationNodeInfosForCurrentFlow.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.viewInfo.request, async (event) => {
      try {
        const viewInfo = await this.getSessionViewInfo();
        event.reply(IpcChannels.session.viewInfo.response, viewInfo);
      } catch (error) {
        event.reply(IpcChannels.session.viewInfo.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.create.request, (event, session: SessionForCreate) => {
      try {
        const newSession = this.fUserManager.addSession(session);
        this.setActive(session.username, session.name, session.procedureName);
        return event.reply(IpcChannels.session.create.response, newSession);
      } catch (error) {
        return event.reply(IpcChannels.session.create.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.rename.request, (event, args: { email: string, procedureName: string, oldName: string, newName: string }) => {
      try {
        this.fUserManager.renameSession(args.email, args.procedureName, args.oldName, args.newName);
        return event.reply(IpcChannels.session.rename.response);
      } catch (error) {
        return event.reply(IpcChannels.session.rename.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.remove.request, (event, args: { email: string, procedureName: string, sessionName: string }) => {
      try {
        this.fUserManager.removeSession(args.email, args.sessionName, args.procedureName);
        return event.reply(IpcChannels.session.remove.response);
      } catch (error) {
        return event.reply(IpcChannels.session.remove.error, error);
      }
    });
  }

  // TODO: Temp function to send updated information to the session view window when node-red deploys
  async getSessionViewInfo(throwOnError: boolean = true) {
    if (!this.fUserManager.activeUser) {
      if (throwOnError) throw new Error('No active user');
    }
    const activeSession = this.fUserManager.activeSession;
    if (!activeSession) {
      if (throwOnError) throw new Error('No active session');
    }
    const user = this.fUserManager.activeUser;
    if (!user || !activeSession) return undefined;
    const procedure = await global.visualCal.procedureManager.getOne(activeSession.procedureName);
    if (!procedure) {
      if (throwOnError) throw new Error(`Procedure, ${activeSession.procedureName}, does not exist`);
    }
    if (!procedure) return undefined;
    const customDriverConfigNodes = NodeRedManager.instance.nodes.filter(n => n.type === 'indysoft-instrument-driver-configuration');
    const sections = NodeRedManager.instance.sections;
    const viewInfo: SessionViewWindowOpenIPCInfo = {
      user: user,
      session: activeSession,
      procedure: procedure,
      sections: sections,
      benchConfig: this.fUserManager.activeBenchConfig ? this.fUserManager.activeBenchConfig : undefined,
      deviceNodes: customDriverConfigNodes.map(n => {
        const editorDef = n.editorDefinition as IndySoftInstrumentDriverConfigurationEditorNode;
        return {
          configNodeId: editorDef.id,
          unitId: editorDef.unitId,
          isCustom: true
        };
      })
    };
    return viewInfo;
  }

  async sendSessionViewInfoToAllWindows() {
    const viewInfo = await this.getSessionViewInfo(false);
    if (!viewInfo) return;
    ipcMain.sendToAll(IpcChannels.session.viewInfo.response, viewInfo);
  }

}
