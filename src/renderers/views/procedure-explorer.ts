import { BrowserView } from 'electron';

export const view = new BrowserView({
  webPreferences: {
    nodeIntegration: true
  }
});
