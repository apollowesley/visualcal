import { screen, BrowserWindow } from 'electron';

export const getNearestScreenToCursor = () => {
  const cursorScreenPoint = screen.getCursorScreenPoint();
  const nearestScreenToCursor = screen.getDisplayNearestPoint(cursorScreenPoint);
  return nearestScreenToCursor;
}

export const centerWindowOnNearestCurorScreen = (window: BrowserWindow, maximize: boolean = true) => {
  let workArea = window.getBounds();
  try {
    workArea = getNearestScreenToCursor().workArea;
  } catch (error) {
    console.warn('Error getting nearest screen to curor.  Possibly running in a VM that is not fullscreen.  This can be safely ignored.');
  }
  try {
    if (!maximize) {
      workArea.x = workArea.x - window.getBounds().width + workArea.width / 2;
      workArea.y = workArea.y - 200 + window.getBounds().height / 2;
      workArea.width = window.getBounds().width;
      workArea.height = window.getBounds().height;
    }
    window.setBounds(workArea);
    window.center();
  } catch (error) {
    console.warn('Error setting window work area.  Possibly running in a VM that is not fullscreen.  This can be safely ignored.');
  }
}
