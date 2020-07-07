import { ipcRenderer } from 'electron';

let selectedSessionNameHeading: HTMLHeadingElement;

let selectedSessionName: string;

const init = () => {
  selectedSessionNameHeading = document.getElementById('vc-selected-session-name') as HTMLHeadingElement;

  ipcRenderer.on('selected-session', (_, sessionName: string) => {
    selectedSessionName = sessionName;
    selectedSessionNameHeading.innerText = selectedSessionName;
  });
}

init();
