import { screen } from 'electron';
import path from 'path';

export const MainWindowConfig = (): CreateWindowOptions => {
  return {
    id: 'main',
    isMain: true,
    config: {
      title: 'VisualCal - Logic Editor',
      fullscreenable: true,
      autoHideMenuBar: false,
      webPreferences: {
        nodeIntegration: false,
        preload: path.join(global.visualCal.dirs.renderers, 'NodeRed.js')
      }
    }
  }
}

export const LoadingWindowConfig = (): CreateWindowOptions => {
  const cursorScreenPoint = screen.getCursorScreenPoint();
  const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
  return {
    id: 'loading',
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

export const ConsoleWindowConfig = (): CreateWindowOptions => {
  return {
    id: 'console',
    isConsole: true,
    config: {
      title: "VisualCal Console",
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        allowRunningInsecureContent: true
      }
    }
  }
}