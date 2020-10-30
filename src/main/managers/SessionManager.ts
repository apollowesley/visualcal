import { ipcMain } from 'electron';
import electronLog from 'electron-log';
import { TypedEmitter } from 'tiny-typed-emitter';
import { SessionViewWindowOpenIPCInfo } from '../../@types/session-view';
import { IpcChannels } from '../../constants';
import { CustomDriverConfigurationNodeEditorDefinition, NodeRedManager } from './NodeRedManager';
import { getDeviceConfigurationNodeInfosForCurrentFlow } from '../node-red/utils';
import { UserManager } from './UserManager';
import { SessionForCreate } from 'visualcal-common/dist/session';

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

  setActive(email: string, name: string) {
    const session = this.fUserManager.getSession(email, name);
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
        const retVal = getDeviceConfigurationNodeInfosForCurrentFlow();
        event.reply(IpcChannels.session.getDeviceConfigurationNodeInfosForCurrentFlow.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.session.getDeviceConfigurationNodeInfosForCurrentFlow.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.getAllForActiveUser.request, (event) => {
      try {
        const activeUser = this.fUserManager.activeUser;
        if (!activeUser) return event.reply(IpcChannels.session.getAllForActiveUser.error, new Error('No active user'));
        const retVal = this.getAllForUser(activeUser.email);
        event.reply(IpcChannels.session.getAllForActiveUser.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.session.getAllForActiveUser.error, error);
      }
    })

    ipcMain.on(IpcChannels.session.viewInfo.request, async (event) => {
      try {
        const viewInfo = await this.getSessionViewInfo();
        event.reply(IpcChannels.session.viewInfo.response, viewInfo);
      } catch (error) {
        event.reply(IpcChannels.session.viewInfo.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.create.request, async (event, session: SessionForCreate) => {
      try {
        const newSession = this.fUserManager.addSession(session);
        this.setActive(session.username, session.name);
        return event.reply(IpcChannels.session.create.response, newSession);
      } catch (error) {
        return event.reply(IpcChannels.session.create.error, error);
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
    const sections = NodeRedManager.instance.visualCalSections;
    const deviceConfigurationNodeInfosForCurrentFlow = getDeviceConfigurationNodeInfosForCurrentFlow();
    const viewInfo: SessionViewWindowOpenIPCInfo = {
      user: user,
      session: activeSession,
      procedure: procedure,
      sections: sections,
      benchConfig: this.fUserManager.activeBenchConfig ? this.fUserManager.activeBenchConfig : undefined,
      deviceNodes: deviceConfigurationNodeInfosForCurrentFlow
    };

    // *** CUSTOM NODES ***
    const customDriverConfigNodes = NodeRedManager.instance.nodes.filter(n => n.type === 'indysoft-custom-driver-configuration');
    customDriverConfigNodes.forEach((n) => {
      const editorDef = n.editorDefinition as CustomDriverConfigurationNodeEditorDefinition;
      viewInfo.deviceNodes.push({
        configNodeId: editorDef.id,
        unitId: editorDef.unitId,
        availableDrivers: viewInfo.deviceNodes[0].availableDrivers,
        isCustom: true
      });
    });
    // ********************

    return viewInfo;
  }

  async sendSessionViewInfoToAllWindows() {
    const viewInfo = await this.getSessionViewInfo(false);
    if (!viewInfo) return;
    ipcMain.sendToAll(IpcChannels.session.viewInfo.response, viewInfo);
  }

}
