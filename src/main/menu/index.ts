import { BrowserWindow, MenuItemConstructorOptions, Menu, dialog } from 'electron';
import { openFlow, saveFlow } from '../menu/menu-actions';
import { WindowManager } from '../managers/WindowManager';
import { checkForUpdates } from '../auto-update';
import { ApplicationManager } from '../managers/ApplicationManager';

interface Options {
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
const create: () => Array<MenuItemConstructorOptions> = () => {
  const template: Array<MenuItemConstructorOptions> = [];

  template.push({
    label: 'Edit',
    submenu: [
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
        click: (_, browserWindow) => {
          if (browserWindow) browserWindow.webContents.cut();
        }
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
        click: (_, browserWindow) => {
          if (browserWindow) browserWindow.webContents.copy();
        }
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
        click: (_, browserWindow) => {
          if (browserWindow) browserWindow.webContents.paste();
        }
      }
    ]
  },
  {
    label:'View',
    submenu: [
      {
        label: 'Import Flow',
        accelerator: "CmdOrCtrl+Shift+O",
        click: async () => { if (WindowManager.instance.mainWindow) await openFlow(WindowManager.instance.mainWindow); }
      },
      {
        label: 'Save Flow As',
        accelerator: "CmdOrCtrl+Shift+S",
        click: async () => { if (WindowManager.instance.mainWindow) await saveFlow(WindowManager.instance.mainWindow); }
      },
      { type: 'separator' },
      {
        label: 'Editor',
        accelerator: "CmdOrCtrl+Shift+E",
        click: async () => {
          await WindowManager.instance.ShowNodeRedEditor();
        }
      },
      {
        label: 'Results',
        accelerator: "CmdOrCtrl+Shift+R",
        click: async () => {
          await WindowManager.instance.showResultsWindow();
        }
      },
      {
        label: 'Interactive Device Control',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: async () => {
          await WindowManager.instance.showInteractiveDeviceControlWindow();
        }
      },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Configuration',
    submenu: [
      {
        label: 'Session',
        submenu: [
          {
            label: 'Bench Configurations',
            click: async () => await WindowManager.instance.showBenchConfigViewWindow()
          }
        ]
      }
    ]
  });

  template.push({
    label: 'Tools',
    submenu: [
      {
        label: 'Driver builder',
        click: async () => await WindowManager.instance.showDriverBuilderWindow()
      }
    ]
  });

  template.push({
    label: 'Options',
    submenu: [
      {
        label: 'Check for updates',
        click: async (menuItem) => await checkForUpdates(menuItem)
      }
    ]
  });

  template.push({
    label: 'Help',
    submenu: [
      {
        label: 'Version',
        click: async () => {
          if (!WindowManager.instance.mainWindow) return;
          dialog.showMessageBoxSync(WindowManager.instance.mainWindow, {
            title: 'VisualCal Version',
            message: ApplicationManager.instance.version
          });
        }
      }
    ]
  });

  // Add Dev menu if in dev mode
  template.push({
    label: 'Development',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (_, focusedWindow) => {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: 'F12',
        click: (_, focusedWindow) => {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Gridstack Test',
        click: async () => await WindowManager.instance.showGridstackTestWindow()
      }
    ]
  })
  return template;
}

export const init = () => {
  const menu = Menu.buildFromTemplate(create());
  Menu.setApplicationMenu(menu);
}
