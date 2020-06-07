import { BrowserWindow, shell, MenuItemConstructorOptions, MenuItem } from 'electron';
import { openFlow, saveFlow, createConsole } from './menu-actions';

const isDev = require('electron-is-dev');

export interface Options {
  mainWindow: BrowserWindow;
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

export interface SubMenuItemClickEvent {
  (item?: any, focusedWindow?: BrowserWindow): void;
}

export interface SubMenuItem {
  label?: string;
  accelerator?: string;
  click?: SubMenuItemClickEvent;
  type?: string;
  role?: string;
  selector?: string;
  submenu?: SubMenuItem[];
}

export type Menu = SubMenuItem[];

// Create the Application's main menu
export default (opts: Options = { mainWindow: undefined, logBuffer: [], showMap: true, allowLoadSave: true, productName: 'VisualCal', nrIcon: '../../../nodered.png', listenPort: 3927, urlDash: '/ui/#/0', urlEdit: '/red', urlMap: '/worldmap', urlConsole: '/console.htm' }) => {
  const template: Array<(MenuItemConstructorOptions) | (MenuItem)> = [{
    label: "View",
    submenu: [
      {
        label: 'Import Flow',
        accelerator: "Shift+CmdOrCtrl+O",
        click() { openFlow(); }
      },
      {
        label: 'Save Flow As',
        accelerator: "Shift+CmdOrCtrl+S",
        click() { saveFlow(opts.nrIcon); }
      },
      { type: 'separator' },
      {
        label: 'Console',
        accelerator: "Shift+CmdOrCtrl+C",
        click() { createConsole(opts.mainWindow, opts.nrIcon, opts.urlConsole, opts.logBuffer); }
      },
      {
        label: 'Dashboard',
        accelerator: "Shift+CmdOrCtrl+D",
        click() { opts.mainWindow.loadURL("http://localhost:" + opts.listenPort + opts.urlDash); }
      },
      {
        label: 'Editor',
        accelerator: "Shift+CmdOrCtrl+E",
        click() { opts.mainWindow.loadURL("http://localhost:" + opts.listenPort + opts.urlEdit); }
      },
      {
        label: 'Worldmap',
        accelerator: "Shift+CmdOrCtrl+M",
        click() { opts.mainWindow.loadURL("http://localhost:" + opts.listenPort + opts.urlMap); }
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
  }];

  if (!opts.showMap) { (template[0].submenu as MenuItemConstructorOptions[]).splice(6, 1); }

  if (!opts.allowLoadSave) { (template[0].submenu as MenuItemConstructorOptions[]).splice(0, 2); }

  // Top and tail menu on Mac
  if (process.platform === 'darwin') {
    const subMenu = template[0].submenu as MenuItemConstructorOptions[];
    subMenu.unshift({ type: 'separator' });
    subMenu.unshift({ label: "About " + opts.productName || "VisualCal" });
    subMenu.unshift({ type: 'separator' });
    subMenu.unshift({ type: 'separator' });
  }

  // Add Dev menu if in dev mode
  if (isDev) {
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
