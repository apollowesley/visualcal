import { screen, BrowserWindow } from 'electron';
import path from 'path';

export const MainWindowConfig = (): CreateWindowOptions => {
  return {
    id: VisualCalWindow.Main,
    config: {
      title: 'VisualCal',
      webPreferences: {
        nodeIntegration: true
      }
    }
  }
}

export const LoadingWindowConfig = (): CreateWindowOptions => {
  const cursorScreenPoint = screen.getCursorScreenPoint();
  const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
  return {
    id: VisualCalWindow.Loading,
    config: {
      height: 200,
      width: 400,
      x: nearestScreenToCursor.workArea.x - 200 + nearestScreenToCursor.bounds.width / 2,
      y: nearestScreenToCursor.workArea.y - 200 + nearestScreenToCursor.bounds.height / 2,
      title: 'VisualCal',
      frame: false,
      transparent: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true
      }
    }
  };
}

export const LoginWindowConfig = (): CreateWindowOptions => {
  return {
    id: VisualCalWindow.Login,
    config: {
      center: true,
      webPreferences: {
        nodeIntegration: true
      }
    }
  }
}

export const ConsoleWindowConfig = (): CreateWindowOptions => {
  return {
    id: VisualCalWindow.Console,
    config: {
      title: "VisualCal Console",
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true
      }
    }
  }
}

export const NodeRedEditorWindowConfig = (): CreateWindowOptions => {
  return {
    id: VisualCalWindow.NodeRedEditor,
    config: {
      title: 'VisualCal - Logic Editor',
      webPreferences: {
        nodeIntegration: false,
        preload: path.join(global.visualCal.dirs.renderers.windows, 'node-red.js')
      }
    }
  }
}

export const CreateProcedureWindowConfig = (parent: BrowserWindow): CreateWindowOptions => {
  return {
    id: VisualCalWindow.CreateProcedure,
    config: {
      title: 'VisualCal - Create Procedure',
      modal: true,
      parent: parent,
      webPreferences: {
        nodeIntegration: true
      }
    }
  }
}

export const CreateSessionWindowConfig = (parent: BrowserWindow): CreateWindowOptions => {
  return {
    id: VisualCalWindow.CreateSession,
    config: {
      title: 'VisualCal - Create Session',
      modal: true,
      parent: parent,
      webPreferences: {
        nodeIntegration: true
      }
    }
  }
}

export const ViewSessionWindowConfig = (parent: BrowserWindow): CreateWindowOptions => {
  return {
    id: VisualCalWindow.ViewSession,
    config: {
      title: 'VisualCal - View Session',
      parent: parent,
      webPreferences: {
        nodeIntegration: true
      }
    }
  }
}

export const UserInstructionWindowConfig = (parent: BrowserWindow): CreateWindowOptions => {
  return {
    id: VisualCalWindow.UserInstruction ,
    config: {
      title: 'VisualCal - User Instruction',
      fullscreenable: false,
      modal: true,
      parent: parent,
      width: 1000,
      height: 750,
      webPreferences: {
        nodeIntegration: true
      }
    }
  }
}

export const UserInputWindowConfig = (parent: BrowserWindow): CreateWindowOptions => {
  return {
    id: VisualCalWindow.UserInput,
    config: {
      title: 'VisualCal - User Input',
      fullscreenable: false,
      modal: true,
      parent: parent,
      width: 1000,
      height: 750,
      webPreferences: {
        nodeIntegration: true
      }
    }
  }
}
