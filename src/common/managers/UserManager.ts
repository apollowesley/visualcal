import { EventEmitter } from 'events';

export class UserManager extends EventEmitter {

  fCurrent: User | null = null;

  constructor() {
    super();
  }

  get current() {
    return this.fCurrent;
  }

  async login(credentials: LoginCredentials) {
    
  }

}
