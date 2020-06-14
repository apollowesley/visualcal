import { BrowserWindow, shell, MenuItemConstructorOptions, app } from 'electron';
import { openFlow, saveFlow, createConsole } from '@/main/menu/menu-actions';
import * as path from 'path';

export interface Options {
  start?: any;
  flowFile?: string;
  addNodes?: boolean;
  kioskMode?: boolean;
  onConWindowOpened?: (conWindow?: BrowserWindow) => void;
  onConWindowClosed?: () => void;
  logBuffer: string[];
  showMap?: boolean;
  allowLoadSave?: boolean;
  productName?: string;
  nrIcon?: string;
  listenPort?: number;
  urlDash?: string;
  urlEdit?: string;
  urlMap?: string;
  urlConsole?: string;
}

// Create the Application's main menu
export const create: () => Array<MenuItemConstructorOptions> = () => {
  const template: Array<MenuItemConstructorOptions> = [];

  if (global.visualCal.isMac) template.push({
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }),

  template.push({
    label: "View",
    submenu: [
      {
        label: 'Import Flow',
        accelerator: "Shift+CmdOrCtrl+O",
        click() { if (global.visualCal.windowManager.mainWindow) openFlow(global.visualCal.windowManager.mainWindow.window); }
      },
      {
        label: 'Save Flow As',
        accelerator: "Shift+CmdOrCtrl+S",
        click() { if (global.visualCal.windowManager.mainWindow) saveFlow(global.visualCal.windowManager.mainWindow.window, global.visualCal.config.appIcon); }
      },
      { type: 'separator' },
      {
        label: 'Console',
        accelerator: "Shift+CmdOrCtrl+C",
        click: async () => {
          console.info('Create console window');
          try {
            await createConsole();
          } catch (error) {
            global.visualCal.logger.error(error);
          }
        }
      },
      {
        label: 'Dashboard',
        accelerator: "Shift+CmdOrCtrl+D",
        click() { if (global.visualCal.windowManager.mainWindow) global.visualCal.windowManager.mainWindow.window.loadURL("http://localhost:" + global.visualCal.config.httpServer.port + '/ui'); }
      },
      {
        label: 'Editor',
        accelerator: "Shift+CmdOrCtrl+E",
        click() {
          if (global.visualCal.windowManager.mainWindow) global.visualCal.windowManager.mainWindow.window.loadURL("http://localhost:" + global.visualCal.config.httpServer.port + '/red');
        }
      },
      {
        label: 'Worldmap',
        accelerator: "Shift+CmdOrCtrl+M",
        click() { if (global.visualCal.windowManager.mainWindow) global.visualCal.windowManager.mainWindow.window.loadURL("http://localhost:" + global.visualCal.config.httpServer.port + '/map'); }
      },
      { type: 'separator' },
      { type: 'separator' },
      {
        label: 'Documentation',
        click() { shell.openExternal('https://nodered.org/docs') }
      },
      {
        label: 'Flows and Nodes',
        click() { shell.openExternal('https://flows.nodered.org') }
      },
      {
        label: 'Discourse Forum',
        click() { shell.openExternal('https://discourse.nodered.org/') }
      },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { role: 'quit' }
    ]
  },
  {
    label: 'System',
    submenu: [
      {
        label: 'Info',
        async click() {
          const systemInfoWindow = new BrowserWindow({
            title: 'System Info',
            center: true,
            webPreferences: {
              nodeIntegration: true
            }
          });
          systemInfoWindow.webContents.on('did-finish-load', () => systemInfoWindow.show());
          await systemInfoWindow.loadFile(path.join(global.visualCal.dirs.html, 'SystemInfo.html'));
        }
      }
    ]
  });

  // Top and tail menu on Mac
  if (process.platform === 'darwin') {
    const subMenu = template[0].submenu as MenuItemConstructorOptions[];
    subMenu.unshift({ type: 'separator' });
    subMenu.unshift({ label: "About VisualCal" });
    subMenu.unshift({ type: 'separator' });
    subMenu.unshift({ type: 'separator' });
  }

  // Add Dev menu if in dev mode
  if (true) {
    template.push({
      label: 'Development',
      submenu: [
        {
          label: 'Reload', accelerator: 'CmdOrCtrl+R',
          click(item, focusedWindow: BrowserWindow) {
            if (focusedWindow) focusedWindow.reload()
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'F12' : 'F12',
          click(item: any, focusedWindow: BrowserWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
          }
        }
      ]
    })
  }
  return template;
}
