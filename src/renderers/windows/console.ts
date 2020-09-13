import { ipcRenderer } from 'electron';
import moment from 'moment';
import Tabulator from 'tabulator-tables';

interface LogicResultTableItem {
  level: string;
  unitId: string;
  value: number;
  timestamp: Date;
  source: string;
}

interface Result {
  timestamp: Date;
  source: string;
}

interface LogicResultMessage extends LoggerMessage {
  message: LogicResult
}


window.moment = moment;

let entries: LogicResultTableItem[] = [];

const table = new Tabulator('#results-table', {
  data: entries,
  layout: 'fitColumns',
  columns: [
    { title: 'Timestamp', field: 'timestamp', width: 150, formatter: 'datetime', formatterParams: { humanize: true }, sorter: 'datetime' },
    { title: 'Timestamp (string)', field: 'timestamp' },
    { title: 'Level', field: 'level', hozAlign: 'left' },
    { title: 'Source', field: 'source' },
    { title: 'Unit Id', field: 'unitId' },
    { title: 'Value', field: 'value' },
  ]
});

const clearList = () => {
  entries = [];
  table.replaceData(entries);
}
ipcRenderer.on('results', (_, data: LogicResultMessage[]) => {
  entries = data.map(d => { return { level: d.level, source: d.message.section, timestamp: d.message.timestamp, unitId: d.message.runId, value: d.message.measuredValue } });
  table.replaceData(entries);
});
ipcRenderer.on('result', (_, data: LogicResultMessage) => {
  const entry = { level: data.level, source: data.message.section, timestamp: data.message.timestamp, unitId: data.message.runId, value: data.message.measuredValue };
  entries.push(entry);
  table.addData([entry]);
});

window.onload = () => {
  const clearListBtn = document.getElementById('clear-list-btn');
  if (clearListBtn) clearListBtn.onclick = () => clearList();
}
