import { ipcMain } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels, SessionViewRequestResponseInfo, Procedure } from 'visualcal-common/dist/session-view-info';
import { NodeRedManager } from './NodeRedManager';
import electronLog from 'electron-log';

interface Events {
  loaded: () => void;
}

const log = electronLog.scope('VueManager');

export class VueManager extends TypedEmitter<Events> {

  private static fInstance = new VueManager;
  public static get instance() { return VueManager.fInstance; }

  private constructor() {
    super();
    this.emit('loaded');
    log.info('Loaded');
    this.initIpcHandlers();
  }

  private initIpcHandlers() {
    ipcMain.on(IpcChannels.Request, async (event) => {
      try {
        const activeProcedureName = await global.visualCal.procedureManager.getActive();
        if (!activeProcedureName) throw new Error('No active procedure');
        const activeProcedure = await global.visualCal.procedureManager.getOne(activeProcedureName);
        if (!activeProcedure) throw new Error('No active procedure');
        const procedure: Procedure = {
          name: activeProcedure.name,
          authorOrganization: activeProcedure.authorOrganization,
          authors: activeProcedure.authors,
          sections: NodeRedManager.instance.sections
        }
        const response: SessionViewRequestResponseInfo = {
          procedure: procedure
        }
        event.reply(IpcChannels.Response, response);
      } catch (error) {
        event.reply(IpcChannels.Error, error.message);
      }
    });
  }

}
