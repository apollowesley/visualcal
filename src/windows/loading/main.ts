import { BrowserWindow, screen } from 'electron';
import path from 'path';

export const create = async (onClose: () => void, duration: number = 5000) => {
  const cursorScreenPoint = screen.getCursorScreenPoint();
  const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
  console.info(nearestScreenToCursor.workArea);
  let loadingScreen: BrowserWindow | null = new BrowserWindow({
    height: 200,
    width: 400,
    x: nearestScreenToCursor.workArea.x - 200 + nearestScreenToCursor.bounds.width / 2,
    y: nearestScreenToCursor.workArea.y - 200 + nearestScreenToCursor.bounds.height / 2,
    frame: false,
    transparent: false,
    resizable: false,
    webPreferences: {
      webSecurity: false
    }
  });
  loadingScreen.webContents.on('did-finish-load', () => {
    if (loadingScreen) loadingScreen.show();
    setTimeout(() => {
      if (loadingScreen) loadingScreen.close();
      loadingScreen = null;
      onClose();
    }, duration);
  });
  await loadingScreen.loadFile(path.join(__dirname, '..', '..', '..', '..', 'src', 'windows', 'loading', 'loading.html'));
  return loadingScreen;
};
