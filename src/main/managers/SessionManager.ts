import { promises as fsPromises } from 'fs';
import path from 'path';
import { IpcChannels, CommunicationInterfaceTypes } from '../../@types/constants';
import { CrudManager } from './CrudManager';
import { ipcMain } from 'electron';

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
    ipcMain.on(IpcChannels.sessions.createCommunicationInterface.request, async (event, sessionName: string, iface: CommunicationInterfaceInfo) => {
      try {
        const retVal = await this.createcommunicationInterface(sessionName, iface);
        event.reply(IpcChannels.sessions.createCommunicationInterface.response, retVal);
      } catch (error) {
        event.reply(IpcChannels.sessions.createCommunicationInterface.error, error);
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

  async createcommunicationInterface(sessionName: string, iface: CommunicationInterfaceInfo) {
    const session = await this.getOne(sessionName);
    if (!session) throw new Error(`Session, ${sessionName}, does not exist`);
    if (!session.configuration) {
      session.configuration = {
        devices: [],
        interfaces: [iface]
      };
    } else {
      session.configuration.interfaces.push(iface);
    }
    await this.update(session);
    return iface;
  }

}
