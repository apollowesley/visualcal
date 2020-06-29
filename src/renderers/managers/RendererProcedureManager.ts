import { IpcChannels } from '../../@types/constants';
import { RendererCRUDManager } from './RendererCRUDManager';

export class RendererProcedureManager extends RendererCRUDManager<CreateProcedureInfo, CreatedProcedureInfo, Procedure> {

  constructor() {
    super(IpcChannels.procedures);
  }

}
