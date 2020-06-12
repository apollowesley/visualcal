import { ipcRenderer } from 'electron';

const logLength = 250;
let list: LogEntry[] = [];

const scrollDown = () => {
  setTimeout(function () {
    window.scrollTo(0, document.body.scrollHeight);
  }, 50);
}
const clearList = () => {
  list = [];
  const debugElement = document.getElementById("debug");
  if (debugElement) debugElement.innerHTML = '';
  ipcRenderer.send('clearLogBuffer', "clear");
}
ipcRenderer.on('logBuff', (event, data) => {
  const debugElement = document.getElementById("debug");
  list = data;
  if (debugElement) debugElement.innerHTML = list.join("<br/>");
});
ipcRenderer.on('debugMsg', (event, data) => {
  const debugElement = document.getElementById("debug");
  list.push(data);
  if (list.length > logLength) { list.shift(); }
  if (debugElement) debugElement.innerHTML = list.join("<br/>");
  window.scrollTo(0, document.body.scrollHeight);
});

document.body.onload = () => {
  scrollDown();
  const clearListBtn = document.getElementById('clear-list-btn');
  if (clearListBtn) clearListBtn.onclick = () => clearList();
}
