import { IpcChannels } from '../../@types/constants';
import { RendererCRUDManager } from './RendererCRUDManager';

export class RendererSessionManager extends RendererCRUDManager<Session, Session, Session> {

  constructor() {
    super(IpcChannels.sessions);
  }

}
