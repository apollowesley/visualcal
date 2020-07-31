import { IpcChannels } from '../../constants';
import { RendererCRUDManager } from './RendererCRUDManager';
import { ipcRenderer } from 'electron';

export class RendererSessionManager extends RendererCRUDManager<Session, Session, Session> {

  constructor() {
    super(IpcChannels.sessions);
  }

  removeCommunicationInterface(sessionName: string, ifaceName: string) {
    ipcRenderer.send(IpcChannels.sessions.removeCommunicationInterface.request, sessionName, ifaceName);
  }

}
