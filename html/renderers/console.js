"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var electron_1 = require("electron");
var moment_1 = __importDefault(require("moment"));
var tabulator_tables_1 = __importDefault(require("tabulator-tables"));
window.moment = moment_1["default"];
var entries = [];
var table = new tabulator_tables_1["default"]('#results-table', {
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
var clearList = function () {
    entries = [];
    table.replaceData(entries);
};
electron_1.ipcRenderer.on('results', function (_, data) {
    entries = data.map(function (d) { return { level: d.level, source: d.message.source, timestamp: d.message.timestamp, unitId: d.message.unitId, value: d.message.value }; });
    table.replaceData(entries);
});
electron_1.ipcRenderer.on('result', function (_, data) {
    var entry = { level: data.level, source: data.message.source, timestamp: data.message.timestamp, unitId: data.message.unitId, value: data.message.value };
    entries.push(entry);
    table.addData([entry]);
});
window.onload = function () {
    var clearListBtn = document.getElementById('clear-list-btn');
    if (clearListBtn)
        clearListBtn.onclick = function () { return clearList(); };
};
//# sourceMappingURL=console.js.map