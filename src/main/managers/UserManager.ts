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

  private fStore: userStore<Store>;

  constructor() {
    super();
    this.fStore = userStore.create<Store>('users.json', UserManagerLog);
    this.fStore.observe('activeUserEmail', () => ipcMain.sendToAll(IpcChannels.user.active.changed, this.active));
    ipcMain.on(IpcChannels.user.active.request, (event) => event.reply(IpcChannels.user.active.response, this.active));
    UserManagerLog.info('Loaded');
  }

  private get users() { return this.fStore.get('users'); }

  get active() {
    const users = this.users;
    if (!users) return null;
    const user = users.find(u => u.email === this.fStore.get('activeUserEmail'));
    if (!user) return null;
    return user;
  }
  set active(user: User | null) {
    if (user) {
      this.fStore.set('activeUserEmail', user.email);
    } else {
      this.fStore.set('activeUserEmail', '');
    }
    ipcMain.sendToAll(IpcChannels.user.active.changed, this.active);
  }

  get all() { return this.fStore.getAll().users; }

  add(user: User) {
    let users = this.users;
    if (!users) users = [];
    users.push(user);
    this.fStore.set('users', users);
  }

}
