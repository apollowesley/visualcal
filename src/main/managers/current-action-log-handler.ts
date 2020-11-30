import { LogEntry } from 'visualcal-common/dist/result';
import { v4 as uuid } from 'uuid';

export const logToCurrentActionRun = (entry: LogEntry) => {
  const currentRun = global.visualCal.actionManager.currentRun;
  if (!currentRun) return;
  if (!currentRun.communicationLogEntries) currentRun.communicationLogEntries = [];
  entry.id = uuid();
  entry.timestamp = new Date();
  currentRun.communicationLogEntries.push(entry);
}
