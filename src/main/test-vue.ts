import { BrowserWindow } from 'electron';
import path from 'path';
import VueDevTools from 'vue-devtools';

export const testVue = async (getLoadUrl: () => string) => {
  if (process.env.NODE_ENV !== 'production') {
    VueDevTools.install();
  }

  const window = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'test-vue-preload.js')
    }
  });
  
  await window.loadURL(getLoadUrl());
  return window;
}
