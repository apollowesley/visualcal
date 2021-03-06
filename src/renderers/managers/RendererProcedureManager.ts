import { IpcChannels } from '../../constants';
import { RendererCRUDManager } from './RendererCRUDManager';

export class RendererProcedureManager extends RendererCRUDManager<CreateProcedureInfo, CreatedProcedureInfo, ProcedureInfo> {

  constructor() {
    super(IpcChannels.procedures);
  }

}
