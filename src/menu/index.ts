import { BrowserWindow, shell, MenuItemConstructorOptions } from 'electron';
import { openFlow, saveFlow, createConsole } from '@menu/menu-actions';
import * as path from 'path';

let conWindow: BrowserWindow | undefined = undefined;

export interface Options {
  start?: any;
  flowFile?: string;
  addNodes?: boolean;
  kioskMode?: boolean;
  onConWindowOpened?(conWindow?: BrowserWindow): void;
  onConWindowClosed?(): void;
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
export const create: (options: Options) => Array<MenuItemConstructorOptions> = (opts: Options = { logBuffer: [], showMap: true, allowLoadSave: true, productName: 'VisualCal', nrIcon: '../../../nodered.png', listenPort: 3927, urlDash: '/ui/#/0', urlEdit: '/red', urlMap: '/worldmap', urlConsole: '../../../console.html' }) => {
  const template: Array<MenuItemConstructorOptions> = [{
    label: "View",
    submenu: [
      {
        label: 'Import Flow',
        accelerator: "Shift+CmdOrCtrl+O",
        click() { if (global.visualCal.mainWindow) openFlow(global.visualCal.mainWindow); }
      },
      {
        label: 'Save Flow As',
        accelerator: "Shift+CmdOrCtrl+S",
        click() { if (global.visualCal.mainWindow && opts.nrIcon) saveFlow(global.visualCal.mainWindow, opts.nrIcon); }
      },
      { type: 'separator' },
      {
        label: 'Console',
        accelerator: "Shift+CmdOrCtrl+C",
        click() {
          if (opts.nrIcon && opts.urlConsole && opts.logBuffer) {
            console.info('Create console window');
            conWindow = createConsole(conWindow, opts.nrIcon, opts.urlConsole, opts.logBuffer);
            if (opts.onConWindowOpened) opts.onConWindowOpened(conWindow);
            if (conWindow) conWindow.on('closed', () => {
              conWindow = undefined
              if (opts.onConWindowClosed) opts.onConWindowClosed();
            });
          } else {
            console.info('Can\'t create console window');
          };
        }
      },
      {
        label: 'Dashboard',
        accelerator: "Shift+CmdOrCtrl+D",
        click() { if (global.visualCal.mainWindow && opts.listenPort && opts.urlDash) global.visualCal.mainWindow.loadURL("http://localhost:" + opts.listenPort + opts.urlDash); }
      },
      {
        label: 'Editor',
        accelerator: "Shift+CmdOrCtrl+E",
        click() {
          if (global.visualCal.mainWindow && opts.listenPort && opts.urlEdit) global.visualCal.mainWindow.loadURL("http://localhost:" + opts.listenPort + opts.urlEdit);
        }
      },
      {
        label: 'Worldmap',
        accelerator: "Shift+CmdOrCtrl+M",
        click() { if (global.visualCal.mainWindow && opts.listenPort && opts.urlMap) global.visualCal.mainWindow.loadURL("http://localhost:" + opts.listenPort + opts.urlMap); }
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
          await systemInfoWindow.loadFile(path.join(__dirname, '..', '..', '..', 'SystemInfo.html'));
        }
      }
    ]
  }];

  // Top and tail menu on Mac
  if (process.platform === 'darwin') {
    const subMenu = template[0].submenu as MenuItemConstructorOptions[];
    subMenu.unshift({ type: 'separator' });
    subMenu.unshift({ label: "About " + opts.productName || "VisualCal" });
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
