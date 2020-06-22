const ipc = window.electron.ipcRenderer;

export interface Section {
  name: string;
}

export interface Procedure {
  name: string;
  sections: Section[];
}


export const getProcedures = (): Promise<Procedure[] | undefined> => {
  console.info('Getting procedures');
  return new Promise((resolve, reject) => {
    try {
      ipc.once('get-procedures-reply', (_, procedures: Procedure[]) => {
        console.info('Response received');
        return resolve(procedures);
      });
      ipc.send('get-procedures-request');
      console.info('Request sent');
    } catch (error) {
      return reject(error);
    }
  });
}

export const createProcedure = (procedure: Procedure): Promise<boolean | Error> => {
  console.info('Creating procedure');
  return new Promise((resolve, reject) => {
    try {
      ipc.once('create-procedure-reply', () => {
        console.info('Response received');
        ipc.removeAllListeners('create-procedure-error');
        return resolve(true);
      });
      ipc.once('create-procedure-error', (_, error: Error) => {
        console.info('Error received');
        ipc.removeAllListeners('create-procedure-reply');
        return reject(error);
      });
      ipc.send('create-procedure-request', procedure);
      console.info('Request sent');
    } catch (error) {
      return reject(error);
    }
  });
}