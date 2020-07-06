import { FileManagerTypedBase } from './FileManagerTypedBase';
import fs, { promises as fsPromises } from 'fs';
import path from 'path';

export class SessionFileManager extends FileManagerTypedBase<Session, Session> {

  static SESSIONS_DIR_NAME = 'sessions';
  static SESSIONS_JSON_NAME = 'sessions.json';
  static SESSION_JSON_NAME = 'session.json';

  constructor(baseDirPath: string) {
    super(baseDirPath, 'session');
  }

  get sessionsJsonPath() { return path.join(this.baseDirPath, SessionFileManager.SESSIONS_JSON_NAME); }

  getSessionDirPath(name: string) { return path.join(this.baseDirPath, name); }
  getSessionJsonPath(name: string) { return path.join(this.getSessionDirPath(name), SessionFileManager.SESSION_JSON_NAME); }

  async ensureInitizilied() {
    if (!fs.existsSync(this.baseDirPath)) await fsPromises.mkdir(this.baseDirPath, { recursive: true });
  }

  getSessions() {
    return this.readAllJsonFiles(SessionFileManager.SESSION_JSON_NAME);
  }

  // ***** ABSTRACT INHERITED *****

  getItemDirPath(name: string): string {
    return this.getSessionDirPath(name);
  }

  getItemFileInfoPath(name: string) {
    return this.getSessionJsonPath(name);
  }

  onRename(oldName: string, newName: string, item: Session): Session {
    item.name = newName;
    return item;
  }

  async onCreatedItemDir(itemDirPath: string, sanitizedName: string) {
    const logicDirPath = path.join(itemDirPath, 'logic');
    const logicFlowFilePath = path.join(logicDirPath, 'flows.json');
    await fsPromises.mkdir(logicDirPath, { recursive: true });
    await fsPromises.writeFile(logicFlowFilePath, '[]');
  }

  async saveItemJson(createItem: Session): Promise<Session> {
    const itemPath = this.getItemFileInfoPath(createItem.name);
    const sessionString = JSON.stringify(createItem);
    await fsPromises.writeFile(itemPath, sessionString);
    return createItem;
  }

  // ******************************

}
