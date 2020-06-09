import { BrowserWindow, screen } from 'electron';
import * as path from 'path';

export const create = async (onClose: () => void, duration: number = 5000) => {
  const cursorScreenPoint = screen.getCursorScreenPoint();
  const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
  let loadingScreen: BrowserWindow = new BrowserWindow({
    height: 200,
    width: 400,
    x: nearestScreenToCursor.workArea.x - 200 + nearestScreenToCursor.bounds.width / 2,
    y: nearestScreenToCursor.workArea.y - 200 + nearestScreenToCursor.bounds.height / 2,
    frame: false,
    transparent: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  await loadingScreen.loadFile(path.join(__dirname, '..', '..', '..', '..', 'loading.html'));
  loadingScreen.webContents.on('did-finish-load', () => {
    if (loadingScreen) loadingScreen.show();
    setTimeout(() => {
      if (loadingScreen) loadingScreen.close();
      onClose();
    }, duration);
  });
  return loadingScreen;
};
