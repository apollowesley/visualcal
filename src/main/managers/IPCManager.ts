import { ipcMain } from 'electron';
import { getAll as getProcedures, getOne as getProcedure, create as createProcedure, remove as removeProcedure } from '../utils/Procedures';

export const init = () => {
  ipcMain.on('get-procedures-request', async (event) => {
    const procedures = await getProcedures();
    event.reply('get-procedures-reply', procedures);
  });

  ipcMain.on('get-procedure-request', async (event, name: string) => {
    const procedure = await getProcedure(name);
    event.reply('get-procedure-reply', procedure);
  });

  ipcMain.on('create-procedure-request', async (event, procedure: Procedure) => {
    try {
      await createProcedure(procedure);
      event.reply('create-procedure-reply', true);
    } catch (error) {
      event.reply('create-procedure-error', error);
    }
  });

  ipcMain.on('remove-procedure', async (event, name: string) => {
    try {
      await removeProcedure(name);
      event.reply('remove-procedure-reply', true);
    } catch (error) {
      event.reply('remove-procedure-error', error);
    }
  });
}
