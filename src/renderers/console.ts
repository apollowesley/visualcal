import { ipcRenderer } from 'electron';
import Tabulator from 'tabulator-tables';
import moment from 'moment';

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
  entries = data.map(d => { return { level: d.level, ...d.message } });
  console.info(data);
  table.replaceData(entries);
});
ipcRenderer.on('result', (_, data: LogicResultMessage) => {
  const entry = { level: data.level, ...data.message };
  entries.push(entry);
  console.info(entry);
  table.addData([entry]);
});

window.onload = () => {
  const clearListBtn = document.getElementById('clear-list-btn');
  if (clearListBtn) clearListBtn.onclick = () => clearList();
}
