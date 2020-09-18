import { BrowserWindow, dialog, ipcMain } from 'electron';
import electronStore from 'electron-cfg';
import electronLog from 'electron-log';
import { TypedEmitter } from 'tiny-typed-emitter';
import { isValidEmailAddress } from '../../common/utils/validation';
import { IpcChannels } from '../../constants';
import { ApplicationManager } from '../managers/ApplicationManager';

const log = electronLog.scope('UserManager');

interface Events {
  activeUserChanged: (user?: User) => void;
  activeSessionChanged: (session?: Session) => void;
  activeBenchConfigChanged: (config?: BenchConfig) => void;
  loggedIn: (user: User) => void;
  loggedOut: (email: string) => void;
}

interface Store {
  users: User[];
}

export class UserManager extends TypedEmitter<Events> {

  private fStore: electronStore<Store> = electronStore.create<Store>('users.json', log);
  private fUsers = new Map<string, User>();
  private fActiveUser: User | null = null;
  private fActiveSession: Session | null = null;
  private fActiveBenchConfig: BenchConfig | null = null;

  constructor() {
    super();
    this.loadStore();
    this.initIpcUserHandlers();
    this.initSessionIpcHandlers();
    this.initBenchConfigIpcHandlers();
    log.info('Loaded');
  }

  private loadStore() {
    this.fStore.get('users', []).forEach(u => this.fUsers.set(u.email.toLocaleUpperCase(), u));
  }

  get all() { return Array.from(this.fUsers).map(u => u[1]); }

  get activeUser() {
    return this.fActiveUser;
  }
  set activeUser(user: User | null) {
    if (user) {
      const existing = this.getOne(user.email.toLocaleUpperCase());
      if (!existing) throw new Error(`User, ${user.email}, does not exist`);
      this.fActiveUser = existing;
    } else {
      this.fActiveUser = null;
    }
    const userToSend = user ? user : undefined;
    ipcMain.sendToAll(IpcChannels.user.active.changed, userToSend);
    this.emit('activeUserChanged', userToSend);
  }

  get activeSession() {
    return this.fActiveSession;
  }
  set activeSession(session: Session | null) {
    if (session) {
      const existing = this.getSession(session.username, session.name);
      if (!existing) throw new Error(`Session, ${session.name}, for user, ${session.username}, does not exist`);
      this.fActiveSession = session;
    } else {
      this.fActiveSession = null;
    }
    const sessionToSend = session ? session : undefined;
    ipcMain.sendToAll(IpcChannels.user.active.changed, sessionToSend);
    this.emit('activeSessionChanged', sessionToSend);
  }

  get activeBenchConfig() {
    return this.fActiveBenchConfig;
  }
  set activeBenchConfig(config: BenchConfig | null) {
    if (config) {
      const existing = this.getBenchConfig(config.username, config.name);
      if (!existing) throw new Error(`Bench configuration, ${config.name}, for user, ${config.username}, does not exist`);
      this.fActiveBenchConfig = config;
    } else {
      this.fActiveBenchConfig = null;
    }
    const configToSend = config ? config : undefined;
    ipcMain.sendToAll(IpcChannels.user.active.changed, configToSend);
    this.emit('activeBenchConfigChanged', configToSend);
  }

  private setOne(user: User) {
    this.fUsers.set(user.email.toLocaleUpperCase(), { ...user, email: user.email.toLocaleLowerCase() });
    this.fStore.set('users', this.all);
  }

  getIsActiveUser(email: string) {
    if (!this.fActiveUser) return undefined;
    return this.fActiveUser.email.toLocaleUpperCase() === email.toLocaleUpperCase();
  }

  getOne(email: string) {
    return this.fUsers.get(email.toLocaleUpperCase());
  }

  getSession(email: string, sessionName: string) {
    const user = this.getOne(email);
    if (!user || !user.sessions) return undefined;
    return user.sessions.find(s => s.name.toLocaleUpperCase() === sessionName.toLocaleUpperCase());
  }

  getBenchConfig(email: string, configName: string) {
    const user = this.getOne(email);
    if (!user || !user.benchConfigs) return undefined;
    return user.benchConfigs.find(s => s.name.toLocaleUpperCase() === configName.toLocaleUpperCase());
  }

  getBenchConfigFromSession(session: Session) {
    if (!session.configuration) throw new Error(`Session, ${session.name}, does not have a configuration`);
    if (!session.configuration.benchConfigName) throw new Error(`Session, ${session.name}, configuration does not have an active bench configuration`);
    const config = this.getBenchConfig(session.username, session.configuration.benchConfigName);
    return config;
  }

  getDeviceConfigs(email: string, sessionName: string) {
    const session = this.getSession(email, sessionName);
    if (!session) throw new Error(`Session, ${sessionName}, does not exist for user email, ${email}`);
    if (!session.configuration) return [];
    return session.configuration.devices;
  }

  getDeviceConfigsFromSession(session: Session) {
    return this.getDeviceConfigs(session.username, session.name);
  }

  add(user: User) {
    const existing = this.getOne(user.email);
    if (existing) throw new Error(`User, ${user.email}, already exists`);
    this.fUsers.set(user.email.toLocaleUpperCase(), { ...user, email: user.email.toLocaleLowerCase() });
    this.fStore.set('users', this.all);
  }

  addSession(session: Session) {
    const user = this.getOne(session.username);
    if (!user) throw new Error(`Unable to add session since user, ${session.username}, does not exist`);
    const existingSession = this.getSession(session.username, session.name);
    if (existingSession) throw new Error(`A session named, ${session.name}, already exists for user, ${session.username}`);
    if (!user.sessions) user.sessions = [];
    user.sessions.push({ ...session, username: session.username.toLocaleLowerCase() });
    this.fStore.set('users', this.all);
  }

  addBenchConfig(config: BenchConfig) {
    const user = this.getOne(config.username);
    if (!user) throw new Error(`Unable to add bench configuration since user, ${config.username}, does not exist`);
    const existingBenchConfig = this.getBenchConfig(config.username, config.name);
    if (existingBenchConfig) throw new Error(`A bench configuration named, ${config.name}, already exists for user, ${config.username}`);
    if (!user.benchConfigs) user.benchConfigs = [];
    user.benchConfigs.push({ ...config, username: config.username.toLocaleLowerCase() });
    this.fStore.set('users', this.all);
  }

  setDeviceConfigs(email: string, sessionName: string, configs: CommunicationInterfaceDeviceNodeConfiguration[]) {
    const user = this.getOne(email);
    if (!user) throw new Error(`Unable to set device configurations since user, ${email}, does not exist`);
    const existingSession = user.sessions.find(s => s.name.toLocaleUpperCase() === sessionName.toLocaleUpperCase());
    if (!existingSession) throw new Error(`Session, ${sessionName}, does not exist for user email, ${email}`);
    if (!existingSession.configuration) existingSession.configuration = { devices: [] };
    existingSession.configuration.devices = configs;
    this.fStore.set('users', this.all);
  }

  exists(email: string) { return this.getOne(email) !== undefined; }

  remove(email: string) {
    const user = this.getOne(email);
    if (user) return;
    this.fUsers.delete(email.toLocaleUpperCase());
    this.fStore.set('users', this.all);
    if (this.getIsActiveUser(email)) this.activeUser = null;
  }

  removeSession(email: string, sessionName: string) {
    const session = this.getSession(email, sessionName);
    if (!session) return;
    const user = this.getOne(email);
    if (!user) throw new Error(`User, ${email}, does not exist`);
    if (!user.sessions) return;
    const sessionIndex = user.sessions.findIndex(s => s.name.toLocaleUpperCase() === session.name.toLocaleUpperCase());
    if (sessionIndex < 0) return;
    user.sessions.splice(sessionIndex, 1);
    this.setOne(user);
  }

  removeAllSessionsForUser(email: string) {
    const user = this.getOne(email);
    if (!user) return;
    user.sessions.length = 0;
    this.setOne(user);
  }

  removeBenchConfig(email: string, configName: string) {
    const config = this.getBenchConfig(email, configName);
    if (!config) return;
    const user = this.getOne(email);
    if (!user) throw new Error(`User, ${email}, does not exist`);
    if (!user.benchConfigs) return;
    const configIndex = user.benchConfigs.findIndex(s => s.name.toLocaleUpperCase() === config.name.toLocaleUpperCase());
    if (configIndex < 0) return;
    user.benchConfigs.splice(configIndex, 1);
    this.setOne(user);
  }

  removeAllBenchConfigsForUser(email: string) {
    const user = this.getOne(email);
    if (!user) return;
    user.benchConfigs.length = 0;
    this.setOne(user);
  }

  update(user: User) {
    const exists = this.fUsers.has(user.email.toLocaleUpperCase());
    if (!exists) throw new Error(`User, ${user.email}, does not exist`);
    this.setOne(user);
  }

  updateSession(session: Session) {
    const existingSession = this.getSession(session.username, session.name);
    if (existingSession) throw new Error(`A session named, ${session.name}, already exists for user, ${session.username}`);
    const user = this.getOne(session.username);
    if (!user) throw new Error(`User, ${session.username}, does not exist`);
    if (!user.sessions) throw new Error(`User, ${session.username}, does not have any sessions to update`);
    const sessionIndex = user.sessions.findIndex(s => s.name.toLocaleUpperCase() === session.name.toLocaleUpperCase());
    if (sessionIndex < 0) throw new Error(`User, ${session.username}, does not have a session, ${session.name}, to update`);
    user.sessions.splice(sessionIndex, 1, session);
    this.setOne(user);
  }

  updateBenchConfig(config: BenchConfig) {
    const existingConfig = this.getBenchConfig(config.username, config.name);
    if (existingConfig) throw new Error(`A bench configuration named, ${config.name}, already exists for user, ${config.username}`);
    const user = this.getOne(config.username);
    if (!user) throw new Error(`User, ${config.username}, does not exist`);
    if (!user.benchConfigs) throw new Error(`User, ${config.username}, does not have any bench configurations to update`);
    const configIndex = user.benchConfigs.findIndex(s => s.name.toLocaleUpperCase() === config.name.toLocaleUpperCase());
    if (configIndex < 0) throw new Error(`User, ${config.username}, does not have a bench configuration, ${config.name}, to update`);
    user.benchConfigs.splice(configIndex, 1, config);
    this.setOne(user);
  }

  login(credentials: LoginCredentials) {
    if (!isValidEmailAddress(credentials.username)) throw new Error('Not a valid email address');
    const user = this.getOne(credentials.username);
    if (user) {
      this.activeUser = user;
      this.emit('loggedIn', user);
    }
    return user;
  }

  logout() {
    const originalActiveUserEmail = this.activeUser ? this.activeUser.email : undefined;
    this.activeUser = null;
    this.activeSession = null;
    this.activeBenchConfig = null;
    if (originalActiveUserEmail) this.emit('loggedOut', originalActiveUserEmail);
  }

  private initIpcUserHandlers() {
    ipcMain.on(IpcChannels.user.active.request, (event) => event.reply(IpcChannels.user.active.response, this.activeUser));

    ipcMain.on(IpcChannels.user.login.request, async (event, credentials: LoginCredentials) => {
      let user: User | undefined = undefined;
      try {
        user = this.login(credentials);
      } catch (error) {
        const err = error as Error;
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return event.reply(IpcChannels.user.login.error, err);
        dialog.showMessageBoxSync(win, { title: 'Login error', message: err.message, type: 'error' });
        return;
      }
      // TODO: Add checking for existing users when we're ready
      // if (!existingUser) return event.reply(IpcChannels.user.login.error, new Error(`Username or password is not correct`));
      const usernameSplit = credentials.username.split('@');
      const nameFirst = usernameSplit[0];
      const nameLast = usernameSplit[1];
      if (!user) {
        if (global.visualCal.windowManager.loginWindow) {
          const askIfUserShouldBeCreatedResponse = await dialog.showMessageBox(global.visualCal.windowManager.loginWindow, {
            title: 'User does not exist',
            message: `The user, ${credentials.username}, does not exist.  Do you want to create the user?`,
            type: 'question',
            buttons: ['Yes', 'No']
          });
          const shouldCreateUser = askIfUserShouldBeCreatedResponse.response === 0;
          if (shouldCreateUser) {
            user = { email: credentials.username, nameFirst: nameFirst, nameLast: nameLast, benchConfigs: [], sessions: [] };
            this.add(user);
            this.emit('loggedIn', user);
          }
        } else {
          ApplicationManager.instance.showErrorAndQuit('Critical error, the application cannot remain open', 'Expected login window to be created and shown, but it was not.');
        }
      } else {
        this.emit('loggedIn', user);
      }
    });
  }

  private initSessionIpcHandlers() {
    ipcMain.on(IpcChannels.session.getAllForActiveUser.request, (event) => {
      const activeUser = this.activeUser;
      if (!activeUser) return event.reply(IpcChannels.session.getAllForActiveUser.error, 'Unable to get sessions for the active user because no active user is set');
      event.reply(IpcChannels.session.getAllForActiveUser.response, activeUser.sessions || []);
    });

    ipcMain.on(IpcChannels.session.setActive.request, (event, name: string) => {
      try {
        const activeUser = this.activeUser;
        if (!activeUser) return event.reply(IpcChannels.session.setActive.error, `Unable to set active session, ${name}, because no active user is set`);
        const session = this.getSession(activeUser.email, name);
        if (!session) return event.reply(IpcChannels.session.setActive.error, `Unable to set active session, ${name}, because is does not exist`);
        this.activeSession = session;
        event.reply(IpcChannels.session.setActive.response, this.activeSession);
      } catch (error) {
        return event.reply(IpcChannels.session.setActive.error, error);
      }
    });
  }

  private initBenchConfigIpcHandlers() {
    ipcMain.on(IpcChannels.user.benchConfig.removeCommInterface.request, (event, arg: { name: string, userEmail: string, benchConfigName: string }) => {
      try {
        const config = this.getBenchConfig(arg.userEmail, arg.benchConfigName);
        if (!config) return event.reply(IpcChannels.user.benchConfig.removeCommInterface.error, new Error(`Unable to remove communication interface, ${arg.name}, because bench configuration, ${arg.benchConfigName} does not exist`));
        const interfaceIndex = config.interfaces.findIndex(i => i.name.toLocaleUpperCase() === arg.name.toLocaleUpperCase());
        if (interfaceIndex < 0) return event.reply(IpcChannels.user.benchConfig.removeCommInterface.error, new Error(`Unable to remove communication interface, ${arg.name}, because it does not exist`)); 
        config.interfaces.splice(interfaceIndex, 1);
        this.updateBenchConfig(config);
      } catch (error) {
        event.reply(IpcChannels.user.benchConfig.removeCommInterface.error, error);
      }
    });
  }

}
