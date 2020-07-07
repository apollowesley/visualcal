import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../../@types/constants';

let selectedSessionNameElement: HTMLHeadingElement;
let interfaceTypeElement: HTMLSelectElement;

let initialData: CreateCommunicationInterfaceInitialData;

const init = () => {
  selectedSessionNameElement = document.getElementById('vc-selected-session-name') as HTMLHeadingElement;
  interfaceTypeElement = document.getElementById('vc-iface-type') as HTMLSelectElement;

  ipcRenderer.on(IpcChannels.sessions.createCommunicationInterfaceInitialData, (_, data: CreateCommunicationInterfaceInitialData) => {
    initialData = data;
    selectedSessionNameElement.innerText = initialData.sessionName;
    for (let index = 0; index < initialData.communicationInterfaceTypes.length; index++) {
      const ifaceType = initialData.communicationInterfaceTypes[index];
      const opt = document.createElement('option');
      opt.value = ifaceType;
      opt.text = ifaceType;
      opt.selected = index === 0;
      interfaceTypeElement.options.add(opt);
    };
  });
}

init();
