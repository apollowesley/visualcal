import { FileManagerBase } from './FileManagerBase';
import fs, { promises as fsPromises } from 'fs';
import path from 'path';

export class SessionFileManager extends FileManagerBase {

  static SESSIONS_DIR_NAME = 'sessions';
  static SESSIONS_JSON_NAME = 'sessions.json';
  static SESSION_JSON_NAME = 'session.json';

  constructor(baseDirPath: string) {
    super(baseDirPath);
  }

  get sessionsJsonPath() { return path.join(this.baseDirPath, SessionFileManager.SESSIONS_JSON_NAME); }

  getSessionDirPath(sessionName: string) { return path.join(this.baseDirPath, sessionName); }
  getSessionJsonPath(sessionName: string) { return path.join(this.getSessionDirPath(sessionName), SessionFileManager.SESSION_JSON_NAME); }

  async ensureInitizilied() {
    if (!fs.existsSync(this.baseDirPath)) await fsPromises.mkdir(this.baseDirPath, { recursive: true });
  }

  async getSessionInfos() {
    const sessionInfos: Session[] = [];
    const possibleSessionDirs = await fsPromises.readdir(this.baseDirPath, { withFileTypes: true });
    for await (const possibleSessionDir of possibleSessionDirs) {
      const jsonPath = this.getSessionJsonPath(possibleSessionDir.name);
      if (!fs.existsSync(jsonPath)) return;
      const content = await this.readFileAsJson<Session>(jsonPath);
      sessionInfos.push(content);
    }
    return sessionInfos;
  }

}
