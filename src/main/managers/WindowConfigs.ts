import { screen } from 'electron';
import path from 'path';

export const MainWindowConfig = (): CreateWindowOptions => {
  return {
    id: VisualCalWindow.Main,
    config: {
      title: 'VisualCal - Logic Editor',
      fullscreenable: true,
      autoHideMenuBar: false,
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
      fullscreenable: true,
      autoHideMenuBar: false,
      webPreferences: {
        nodeIntegration: false,
        preload: path.join(global.visualCal.dirs.renderers.windows, 'nodered.js')
      }
    }
  }
}

export const CreateProcedureWindowConfig = (): CreateWindowOptions => {
  return {
    id: VisualCalWindow.CreateProcedure,
    config: {
      title: 'VisualCal - Create Procedure',
      fullscreenable: false,
      modal: true,
      autoHideMenuBar: false,
      webPreferences: {
        nodeIntegration: true
      }
    }
  }
}

export const CreateSessionWindowConfig = (): CreateWindowOptions => {
  return {
    id: VisualCalWindow.CreateSession,
    config: {
      title: 'VisualCal - Create Session',
      fullscreenable: false,
      modal: true,
      autoHideMenuBar: false,
      webPreferences: {
        nodeIntegration: true
      }
    }
  }
}
