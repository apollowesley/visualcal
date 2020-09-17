import { ipcMain } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels } from 'visualcal-common/types/session-view-info';

interface Events {
  loaded: () => void;
}

export class VueManager extends TypedEmitter<Events> {

  private static fInstance = new VueManager;
  public static get instance() { return VueManager.fInstance; }

  private constructor() {
    super();
    this.emit('loaded');
    console.info('Loaded');
    this.initIpcHandlers();
  }

  private initIpcHandlers() {
    ipcMain.on(IpcChannels.Request, async (event) => {
      event.reply('vue-session-view-info-response', null);
    });
  }

}
