import { BrowserWindow } from 'electron';
import path from 'path';

export const testVue = async () => {
  const window = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'test-vue-preload.js')
    }
  });
  
  await window.loadURL('http://127.0.0.1:18880/vue');
  return window;
}
