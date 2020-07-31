import { promises as fsPromises } from 'fs';
import path from 'path';
import { IpcChannels, CommunicationInterfaceTypes } from '../../constants';
import { CrudManager } from './CrudManager';
import { ipcMain } from 'electron';
import { getDeviceConfigurationNodeInfosForCurrentFlow } from '../node-red/utils';

export class SessionManager extends CrudManager<Session, Session, Session, Session> {

  constructor(basePath: string) {
    super(basePath, IpcChannels.sessions, 'session');

    ipcMain.on(IpcChannels.sessions.getCommunicationInterfaceTypes.request, async (event) => {
      try {
        const retVal = await this.getCommunicationInterfaceTypes();
        event.reply(IpcChannels.sessions.getCommunicationInterfaceTypes.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.sessions.getCommunicationInterfaceTypes.error, error);
      }
    });

    ipcMain.on(IpcChannels.sessions.getCommunicationInterfaces.request, async (event, sessionName: string) => {
      try {
        const retVal = await this.getCommunicationInterfaces(sessionName);
        event.reply(IpcChannels.sessions.getCommunicationInterfaces.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.sessions.getCommunicationInterfaces.error, error);
      }
    });

    ipcMain.on(IpcChannels.sessions.createCommunicationInterface.request, async (event, sessionName: string, iface: CommunicationInterfaceConfigurationInfo) => {
      try {
        const retVal = await this.createCommunicationInterface(sessionName, iface);
        event.reply(IpcChannels.sessions.createCommunicationInterface.response, { sessionName, retVal });
        // next line need to target mainWindow, since original request from from create-comm-iface script file
        if (global.visualCal.windowManager.mainWindow) global.visualCal.windowManager.mainWindow.webContents.send(IpcChannels.sessions.createCommunicationInterface.response, { sessionName, iface: retVal });
      } catch (error) {
        event.reply(IpcChannels.sessions.createCommunicationInterface.error, error);
        // next line need to target mainWindow, since original request from from create-comm-iface script file
        if (global.visualCal.windowManager.mainWindow) global.visualCal.windowManager.mainWindow.webContents.send(IpcChannels.sessions.createCommunicationInterface.error, error);
      }
    });

    ipcMain.on(IpcChannels.sessions.removeCommunicationInterface.request, async (event, sessionName: string, ifaceName: string) => {
      try {
        const retVal = await this.removeCommunicationInterface(sessionName, ifaceName);
        event.reply(IpcChannels.sessions.removeCommunicationInterface.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.sessions.removeCommunicationInterface.error, error);
      }
    });

    ipcMain.on(IpcChannels.sessions.getDeviceConfigurationNodeInfosForCurrentFlow.request, async (event) => {
      try {
        const retVal = getDeviceConfigurationNodeInfosForCurrentFlow();
        event.reply(IpcChannels.sessions.getDeviceConfigurationNodeInfosForCurrentFlow.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.sessions.getDeviceConfigurationNodeInfosForCurrentFlow.error, error);
      }
    });
  }

  static SESSIONS_JSON_FILE_NAME = 'sessions.json';

  static SESSION_RESULTS_FOLDER_NAME = 'results';
  static SESSION_JSON_FILE_NAME = 'session.json';
 
  getSessionDirPath(name: string) {
    const procDir = path.join(global.visualCal.dirs.userHomeData.sessions, name);
    return procDir;
  };
  
  async createSessionsDir() { await fsPromises.mkdir(global.visualCal.dirs.userHomeData.sessions); };
  async createSessionResultsDir(name: string) { await fsPromises.mkdir(path.join(this.getSessionDirPath(name), SessionManager.SESSION_RESULTS_FOLDER_NAME)); };
  async createSessionResultsFile(name: string) { await fsPromises.writeFile(path.join(this.getSessionDirPath(name), SessionManager.SESSION_RESULTS_FOLDER_NAME, 'results.json'), JSON.stringify([])); };

  protected async onCreatedItemDir(itemDirPath: string, sanitizedName: string): Promise<void> {
    await this.createSessionResultsDir(sanitizedName);
    await this.createSessionResultsFile(sanitizedName);
  }

  protected getCreatedItem(createItem: Session) {
    return {
      ...createItem
    };
  }

  protected async onSetActive(name: string) {
    const session = await this.getItemJson(name);
    try {
      await global.visualCal.procedureManager.setActive(session.procedureName);
      await global.visualCal.nodeRedFlowManager.load(session);
    } catch (error) {
      console.error(error);
    }
  }

  // ***** COMMUNICATION INTERFACES *****

  async getCommunicationInterfaceTypes() {
    return CommunicationInterfaceTypes.sort();
  }

  async getCommunicationInterfaces(sessionName: string) {
    const session = await this.getOne(sessionName);
    if (!session) throw new Error(`Session, ${sessionName}, does not exist`);
    if (session.configuration) return session.configuration.interfaces;
    return [];
  }

  async createCommunicationInterface(sessionName: string, iface: CommunicationInterfaceConfigurationInfo) {
    const session = await this.getOne(sessionName);
    if (!session) throw new Error(`Session, ${sessionName}, does not exist`);
    const existingIfaceWithSameName = session.configuration.interfaces.find(i => i.name.toLocaleUpperCase() === iface.name.toLocaleUpperCase());
    if (existingIfaceWithSameName) throw new Error(`Interface, ${iface.name}, already exists in session, ${sessionName}`);
    session.configuration.interfaces.push(iface);
    await this.update(session);
    return iface;
  }

  async removeCommunicationInterface(sessionName: string, ifaceName: string) {
    const session = await this.getOne(sessionName);
    if (!session) throw new Error(`Session, ${sessionName}, does not exist`);
    const ifaceIndex = session.configuration.interfaces.findIndex(findIface => findIface.name === ifaceName);
    session.configuration.interfaces.splice(ifaceIndex, 1);
    await this.update(session);
    return { sessionName: sessionName, ifaceName: ifaceName };
  }

  // ***** DEVICES *****

}
