import { BrowserWindow, dialog, ipcMain } from 'electron';
import { IpcChannels } from '../../constants';
import electronStore from 'electron-cfg';
import { TypedEmitter } from 'tiny-typed-emitter';
import electronLog from 'electron-log';
import { isValidEmailAddress } from '../../common/utils/validation';

const log = electronLog.scope('UserManager');

interface Events {
  activeChanged: (user?: User) => void;
}

interface Store {
  activeUserEmail: string;
  users: User[];
}

export class UserManager extends TypedEmitter<Events> {

  private fStore: electronStore<Store> = electronStore.create<Store>('users.json', log);

  constructor() {
    super();
    this.verifyActiveUserExistsAndClearIfNot();
    this.fStore.observe('activeUserEmail', () => ipcMain.sendToAll(IpcChannels.user.active.changed, this.active));
    ipcMain.on(IpcChannels.user.active.request, (event) => event.reply(IpcChannels.user.active.response, this.active));
    ipcMain.on(IpcChannels.user.login.request, async (event, loginInfo: LoginCredentials) => {
      if (!isValidEmailAddress(loginInfo.username)) {
        const errorMsg = 'username is not an email address';
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return event.reply(IpcChannels.user.login.error, new Error(errorMsg));
        dialog.showMessageBoxSync(win, { title: 'Invalid credentials', message: errorMsg, type: 'error' });
        return;
      }
      let user = this.getOne(loginInfo.username);
      // TODO: Add checking for existing users when we're ready
      // if (!existingUser) return event.reply(IpcChannels.user.login.error, new Error(`Username or password is not correct`));
      const usernameSplit = loginInfo.username.split('@');
      const nameFirst = usernameSplit[0];
      const nameLast = usernameSplit[1];
      if (!user) {
        user = this.add({ email: loginInfo.username, nameFirst: nameFirst, nameLast: nameLast });
      }
      // No reason to reply, we're closing the login window
      // event.reply(IpcChannels.user.login.response, user);
      await global.visualCal.windowManager.showSelectProcedureWindow();
    });
    log.info('Loaded');
  }

  private get users() { return this.fStore.get('users', []); }

  get active() {
    const activeUser = this.users.find(u => u.email.toLocaleUpperCase() === this.fStore.get('activeUserEmail', '').toLocaleUpperCase());
    if (!activeUser) return null;
    return activeUser;
  }
  set active(user: User | null) {
    if (user) {
      this.fStore.set('activeUserEmail', user.email);
    } else {
      this.fStore.delete('activeUserEmail');
    }
    ipcMain.sendToAll(IpcChannels.user.active.changed, this.active);
  }

  private verifyActiveUserExistsAndClearIfNot() {
    const activeUser = this.active;
    if (!activeUser) this.fStore.delete('activeUserEmail');
  }

  add(user: User) {
    let users = this.users;
    if (!users) users = [];
    users.push(user);
    this.fStore.set('users', users);
    return user;
  }

  getOne(email: string) {
    return this.users.find(u => u.email.toLocaleUpperCase() === email.toLocaleUpperCase());
  }

  exists(email: string) { return this.getOne(email) !== undefined; }

  remove(email: string) {
    if (!this.exists(email)) return;
    const removeAt = this.users.findIndex(u => u.email.toLocaleUpperCase() === email.toLocaleUpperCase());
    const users = this.users;
    users.splice(removeAt, 1);
    if (users.length <= 0) this.clear();
    else this.fStore.set('users', users);
  }

  clear() {
    this.fStore.delete('activeUserEmail');
    this.fStore.delete('users');
  }

}
