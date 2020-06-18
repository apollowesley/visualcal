import { screen, BrowserWindow } from 'electron';

export const getNearestScreenToCursor = () => {
  const cursorScreenPoint = screen.getCursorScreenPoint();
  const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
  return nearestScreenToCursor;
}

export const centerWindowOnNearestCurorScreen = (window: BrowserWindow, maximize: boolean = true) => {
  const workArea = getNearestScreenToCursor().workArea;
  if (!maximize) {
    workArea.x = workArea.x - window.getBounds().width + workArea.width / 2;
    workArea.y = workArea.y - 200 + window.getBounds().height / 2;
    workArea.width = window.getBounds().width;
    workArea.height = window.getBounds().height;
  }
  window.setBounds(workArea);
}
