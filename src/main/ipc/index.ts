import { app, ipcMain } from 'electron';
import { IpcChannels } from '../../constants';
import path from 'path';
import { promises as fsPromises } from 'fs';

const mainEventNames = ipcMain.eventNames().map(n => n.toString());
const rendererEventNames = new Map<string, VisualCalWindow[]>();

const addRendererEventNames = (winId: VisualCalWindow, names: (string | symbol)[]) => {
  names.forEach(name => {
    const eventName = name.toString();
    let winIds = rendererEventNames.get(eventName);
    if (!winIds) winIds = [];
    if (winIds.find(wid => wid === winId)) return;
    winIds.push(winId);
    rendererEventNames.set(eventName, winIds);
  });
}

const getComparison = () => {
  const matched = mainEventNames.filter(men => rendererEventNames.has(men));
  const unMatched = mainEventNames.filter(men => !rendererEventNames.has(men));
  const rendererEvents: { winId: VisualCalWindow, name: string }[] = [];
  rendererEventNames.forEach((value, key) => {
    value.forEach(winId => {
      const item = { winId, name: key, mainEvent: mainEventNames.find(m => m === key) };
      if (!rendererEvents.includes(item)) rendererEvents.push(item);
    });
  });
  return {
    matched,
    unMatched,
    mainEventNames,
    rendererEventNames,
    rendererEvents
  }
}

export const saveComparison = async (filePath?: string) => {
  const comparison = getComparison();
  const comparisonString = JSON.stringify(comparison);
  if (!filePath) filePath = path.join(app.getPath('documents'), 'visualcal-ipc-event-names.json');
  await fsPromises.writeFile(filePath, comparisonString);
}

export default function() {
  ipcMain.on(IpcChannels.ipc.addRendererEventNames, (_, arg: { winId: VisualCalWindow, names: (string | symbol)[] }) => addRendererEventNames(arg.winId, arg.names));
}
