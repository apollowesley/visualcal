import { ipcMain } from 'electron';
import { IpcChannels } from '../../constants';
import userStore from 'electron-cfg';
import { TypedEmitter } from 'tiny-typed-emitter';
import log from 'electron-log';

const UserManagerLog = log.scope('UserManager');

interface Events {
  activeChanged: (user?: User) => void;
}

interface Store {
  activeUserEmail: string;
  users: User[];
}

export class UserManager extends TypedEmitter<Events> {

  private fStore: userStore<Store> = userStore.create<Store>('users.json', UserManagerLog);

  constructor() {
    super();
    this.verifyActiveUserExistsAndClearIfNot();
    this.fStore.observe('activeUserEmail', () => ipcMain.sendToAll(IpcChannels.user.active.changed, this.active));
    ipcMain.on(IpcChannels.user.active.request, (event) => event.reply(IpcChannels.user.active.response, this.active));
    UserManagerLog.info('Loaded');
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
