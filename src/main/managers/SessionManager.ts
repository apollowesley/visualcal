import { ipcMain } from 'electron';
import electronStore from 'electron-cfg';
import electronLog from 'electron-log';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { TypedEmitter } from 'tiny-typed-emitter';
import { SessionViewWindowOpenIPCInfo } from '../../@types/session-view';
import { CommunicationInterfaceTypes, IpcChannels } from '../../constants';
import NodeRed from '../node-red';
import { getDeviceConfigurationNodeInfosForCurrentFlow } from '../node-red/utils';

const log = electronLog.scope('SessionManager');
const nodeRed = NodeRed();

interface Events {
  activeChanged: (session?: Session) => void;
}

interface Store {
  active: string;
  sessions: Session[];
}

export class SessionManager extends TypedEmitter<Events> {

  private fStore: electronStore<Store> = electronStore.create<Store>('sessions.json', log);

  constructor() {
    super();
    this.verifyActiveExistsAndClearIfNot();
    this.fStore.observe('active', async (name) => {
      const session = this.getOne(name);
      if (session) {
        await global.visualCal.procedureManager.setActive(session.procedureName);
        await global.visualCal.nodeRedFlowManager.load(session);
      }
      const active = this.active;
      ipcMain.sendToAll(IpcChannels.session.active.changed, active);
      this.emit('activeChanged', active ? active : undefined);
    });
    this.initIpcEventHandlers();
    log.info('Loaded');
  }

  static SESSIONS_JSON_FILE_NAME = 'sessions.json';

  static SESSION_RESULTS_FOLDER_NAME = 'results';
  static SESSION_JSON_FILE_NAME = 'session.json';
 
  get all() { return this.fStore.get('sessions', []); }

  get active() {
    const activeSession = this.all.find(s => s.name.toLocaleUpperCase() === this.fStore.get('active', '').toLocaleUpperCase());
    if (!activeSession) return null;
    return activeSession;
  }
  set active(session: Session | null) {
    if (session) {
      this.fStore.set('active', session.name);
    } else {
      this.fStore.delete('active');
    }
  }

  private verifyActiveExistsAndClearIfNot() {
    const activeUser = this.active;
    if (!activeUser) this.fStore.delete('active');
  }

  getOne(name: string) {
    return this.all.find(s => s.name.toLocaleUpperCase() === name.toLocaleUpperCase());
  }

  getAllForUser(email: string) {
    return this.all.map(s => s.username.toLocaleUpperCase() === email.toLocaleUpperCase());
  }

  update(session: Session) {
    const existing = this.getOne(session.name);
    if (!existing) throw new Error(`Session, ${session.name}, does not exist`);
    const sessions = this.all;
    const existingIndex = sessions.indexOf(existing);
    if (existingIndex < 0) throw new Error(`Session, ${session.name}, does not exist`);
    sessions.splice(existingIndex, 1, session);
    this.fStore.set('sessions', sessions);
  }

  // ***** COMMUNICATION INTERFACES *****

  getCommunicationInterfaceTypes() {
    return CommunicationInterfaceTypes.sort();
  }

  getCommunicationInterfaces(sessionName: string) {
    const session = this.getOne(sessionName);
    if (!session) throw new Error(`Session, ${sessionName}, does not exist`);
    if (session.configuration) return session.configuration.interfaces;
    return [];
  }

  createCommunicationInterface(sessionName: string, iface: CommunicationInterfaceConfigurationInfo) {
    const session = this.getOne(sessionName);
    if (!session) throw new Error(`Session, ${sessionName}, does not exist`);
    const existingIfaceWithSameName = session.configuration.interfaces.find(i => i.name.toLocaleUpperCase() === iface.name.toLocaleUpperCase());
    if (existingIfaceWithSameName) throw new Error(`Interface, ${iface.name}, already exists in session, ${sessionName}`);
    session.configuration.interfaces.push(iface);
    this.update(session);
    return iface;
  }

  removeCommunicationInterface(sessionName: string, ifaceName: string) {
    const session = this.getOne(sessionName);
    if (!session) throw new Error(`Session, ${sessionName}, does not exist`);
    const ifaceIndex = session.configuration.interfaces.findIndex(findIface => findIface.name === ifaceName);
    session.configuration.interfaces.splice(ifaceIndex, 1);
    this.update(session);
    return { sessionName: sessionName, ifaceName: ifaceName };
  }

  initIpcEventHandlers() {
    ipcMain.on(IpcChannels.session.setActive.request, (event, name: string) => {
      this.fStore.set('active', name);
      event.reply(IpcChannels.session.setActive.response, name);
    });

    ipcMain.on(IpcChannels.session.getCommunicationInterfaceTypes.request, (event) => {
      try {
        const retVal = this.getCommunicationInterfaceTypes();
        event.reply(IpcChannels.session.getCommunicationInterfaceTypes.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.session.getCommunicationInterfaceTypes.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.getCommunicationInterfaces.request, (event, sessionName: string) => {
      try {
        const retVal = this.getCommunicationInterfaces(sessionName);
        event.reply(IpcChannels.session.getCommunicationInterfaces.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.session.getCommunicationInterfaces.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.createCommunicationInterface.request, (event, sessionName: string, iface: CommunicationInterfaceConfigurationInfo) => {
      try {
        const retVal = this.createCommunicationInterface(sessionName, iface);
        event.reply(IpcChannels.session.createCommunicationInterface.response, { sessionName, retVal });
        // next line need to target mainWindow, since original request from from create-comm-iface script file
        if (global.visualCal.windowManager.mainWindow) global.visualCal.windowManager.mainWindow.webContents.send(IpcChannels.session.createCommunicationInterface.response, { sessionName, iface: retVal });
      } catch (error) {
        event.reply(IpcChannels.session.createCommunicationInterface.error, error);
        // next line need to target mainWindow, since original request from from create-comm-iface script file
        if (global.visualCal.windowManager.mainWindow) global.visualCal.windowManager.mainWindow.webContents.send(IpcChannels.session.createCommunicationInterface.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.removeCommunicationInterface.request, (event, sessionName: string, ifaceName: string) => {
      try {
        const retVal = this.removeCommunicationInterface(sessionName, ifaceName);
        event.reply(IpcChannels.session.removeCommunicationInterface.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.session.removeCommunicationInterface.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.getDeviceConfigurationNodeInfosForCurrentFlow.request, (event) => {
      try {
        const retVal = getDeviceConfigurationNodeInfosForCurrentFlow();
        event.reply(IpcChannels.session.getDeviceConfigurationNodeInfosForCurrentFlow.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.session.getDeviceConfigurationNodeInfosForCurrentFlow.error, error);
      }
    });

    ipcMain.on(IpcChannels.session.viewInfo.request, (event) => {
      const activeSession = this.active;
      if (!activeSession) {
        event.reply(IpcChannels.session.viewInfo.error, new Error('No active session'));
        return;
      }
      const sections: SectionInfo[] = nodeRed.visualCalSectionConfigurationNodes.map(n => { return { name: n.runtime.name, shortName: n.runtime.shortName, actions: [] }; });
      sections.forEach(s => {
        s.actions = nodeRed.getVisualCalActionStartNodesForSection(s.shortName).map(a => { return { name: a.runtime.name }; });
      });
      const deviceConfigurationNodeInfosForCurrentFlow = getDeviceConfigurationNodeInfosForCurrentFlow();
      const viewInfo: SessionViewWindowOpenIPCInfo = {
        session: activeSession,
        sections: sections,
        deviceConfigurationNodeInfosForCurrentFlow: deviceConfigurationNodeInfosForCurrentFlow
      };
      event.reply(IpcChannels.session.viewInfo.response, viewInfo);
    });
  }

}
