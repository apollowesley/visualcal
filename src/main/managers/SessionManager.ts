import { promises as fsPromises } from 'fs';
import path from 'path';
import { IpcChannels } from '../../@types/constants';
import { CrudManager } from './CrudManager';

export class SessionManager extends CrudManager<Session, Session, Session, Session> {

  constructor(basePath: string) {
    super(basePath, IpcChannels.sessions, 'session');
  }

  static SESSIONS_JSON_FILE_NAME = 'sessions.json';

  static SESSION_RESULTS_FOLDER_NAME = 'results';
  static SESSION_JSON_FILE_NAME = 'session.json';
 
  getSessionDirPath(name: string) {
    const procDir = path.join(global.visualCal.dirs.sessions, name);
    return procDir;
  };
  
  async createSessionsDir() { await fsPromises.mkdir(global.visualCal.dirs.sessions); };
  async createSessionResultsDir(name: string) { await fsPromises.mkdir(path.join(this.getSessionDirPath(name), SessionManager.SESSION_RESULTS_FOLDER_NAME)); };
  async createSessionResultsFile(name: string) { await fsPromises.writeFile(path.join(this.getSessionDirPath(name), SessionManager.SESSION_RESULTS_FOLDER_NAME, 'results.json'), JSON.stringify({})); };

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
      await global.visualCal.nodeRedFlowManager.load(session.procedureName);
    } catch (error) {
      console.error(error);
    }
  }

}
