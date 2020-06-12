import { ipcRenderer } from 'electron';
import Tabulator from 'tabulator-tables';
import moment from 'moment';

window.moment = moment;

let entries: LogicResult[] = [];

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
ipcRenderer.on('results', (_, data: LogicResult[]) => {
  entries = data;
  table.replaceData(entries);
});
ipcRenderer.on('result', (_, data: LogicResult) => {
  entries.push(data);
  table.addData([data]);
});

window.onload = () => {
  const clearListBtn = document.getElementById('clear-list-btn');
  if (clearListBtn) clearListBtn.onclick = () => clearList();
}
