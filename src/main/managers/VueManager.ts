import { ipcMain } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels, SessionViewRequestResponseInfo, Procedure } from 'visualcal-common/types/session-view-info';
import nodeRed from '../node-red';

const visualCalNodeRed = nodeRed();

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
      try {
        const activeProcedureName = await global.visualCal.procedureManager.getActive();
        if (!activeProcedureName) throw new Error('No active procedure');
        const activeProcedure = await global.visualCal.procedureManager.getOne(activeProcedureName);
        if (!activeProcedure) throw new Error('No active procedure');
        const procedure: Procedure = {
          name: activeProcedure.name,
          authorOrganization: activeProcedure.authorOrganization,
          authors: activeProcedure.authors,
          sections: visualCalNodeRed.visualCalSections
        }
        activeProcedure.sections.forEach(s => procedure.sections.push({ name: s.name, actions: [] }));
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
