import { ipcMain } from 'electron';

export const init = () => {
  ipcMain.on('get-procedures-request', async (event) => {
    const procedures = await global.visualCal.procedureManager.getAll();
    event.reply('get-procedures-reply', procedures);
  });

  ipcMain.on('get-procedure-request', async (event, name: string) => {
    const procedure = await global.visualCal.procedureManager.getOne(name);
    event.reply('get-procedure-reply', procedure);
  });

  ipcMain.on('create-procedure-request', async (event, procedure: Procedure) => {
    try {
      await global.visualCal.procedureManager.create(procedure);
      event.reply('create-procedure-reply', true);
    } catch (error) {
      event.reply('create-procedure-error', error);
    }
  });

  ipcMain.on('remove-procedure', async (event, name: string) => {
    try {
      await global.visualCal.procedureManager.remove(name);
      event.reply('remove-procedure-reply', true);
    } catch (error) {
      event.reply('remove-procedure-error', error);
    }
  });
}
