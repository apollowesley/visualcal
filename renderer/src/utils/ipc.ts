import type { IpcRendererEvent } from 'electron';
import { IpcChannels } from '@/constants'
const ipc = window.electron.ipcRenderer;

export const getProcedures = () => ipc.send(IpcChannels.procedures.get.request);
export const onGetProceduresResponse = (reply: (event: IpcRendererEvent, procedures: Procedure[]) => void, err?: (event: IpcRendererEvent, err: Error) => void) => {
  ipc.on(IpcChannels.procedures.get.response, reply);
  if (err) ipc.on(IpcChannels.procedures.get.error, err);
}

export const createProcedure = (procedure: Procedure) => ipc.send(IpcChannels.procedures.create.request, procedure);
export const onCreateProceduresResponse = (reply: (event: IpcRendererEvent) => void, err?: (event: IpcRendererEvent, err: Error) => void) => {
  ipc.on(IpcChannels.procedures.get.response, reply);
  if (err) ipc.on(IpcChannels.procedures.get.error, err);
}


export const removeAllListeners = (channel?: string) => {
  if (channel) {
    ipc.removeAllListeners(channel);
    return;
  }
  Object.keys(IpcChannels.procedures.get).forEach(c => ipc.removeAllListeners(c));
  Object.keys(IpcChannels.procedures.create).forEach(c => ipc.removeAllListeners(c));
}
