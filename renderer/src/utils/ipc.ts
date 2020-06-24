import type { IpcRendererEvent } from 'electron';
const ipc = window.electron.ipcRenderer;

const channels = {
  procedures: {
    get: {
      request: 'get-procedures-request',
      response: 'get-procedures-reply',
      error: 'get-procedures-error'
    },
    create: {
      request: 'create-procedure-request',
      response: 'create-procedure-reply',
      error: 'create-procedure-error'
    }
  }
}

export const getProcedures = () => ipc.send(channels.procedures.get.request);
export const onGetProceduresResponse = (reply: (event: IpcRendererEvent, procedures: Procedure[]) => void, err?: (event: IpcRendererEvent, err: Error) => void) => {
  ipc.on(channels.procedures.get.response, reply);
  if (err) ipc.on(channels.procedures.get.error, err);
}

export const createProcedure = (procedure: Procedure) => ipc.send(channels.procedures.create.request, procedure);
export const onCreateProceduresResponse = (reply: (event: IpcRendererEvent) => void, err?: (event: IpcRendererEvent, err: Error) => void) => {
  ipc.on(channels.procedures.get.response, reply);
  if (err) ipc.on(channels.procedures.get.error, err);
}


export const removeAllListeners = (channel?: string) => {
  if (channel) {
    ipc.removeAllListeners(channel);
    return;
  }
  Object.keys(channels.procedures.get).forEach(c => ipc.removeAllListeners(c));
  Object.keys(channels.procedures.create).forEach(c => ipc.removeAllListeners(c));
}
