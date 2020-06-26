import { ipcMain } from 'electron';

export const isLoggedIn = () => global.visualCal.user !== null;

export const login = (credentials: LoginCredentials) => {
  return credentials.username.toLocaleUpperCase() === 'TEST@EXAMPLE.COM'.toLocaleUpperCase();
};

export const listenForLogin = () => {
  ipcMain.once('login', async (event, args: LoginCredentials) => {
    if (!args) return event.sender.send('login-error', 'Missing credentials');
    const credentials = args;
    const result = login(credentials);
    if (result) {
      await global.visualCal.windowManager.ShowMain();
      if (global.visualCal.windowManager.loadingWindow) {
        global.visualCal.windowManager.loadingWindow.close();
      }
      global.visualCal.user = {
        email: credentials.username,
        nameFirst: credentials.username,
        nameLast: credentials.username
      }
    } else {
      event.reply('login-error', 'Incorrect login credentials');
    }
  });
}
