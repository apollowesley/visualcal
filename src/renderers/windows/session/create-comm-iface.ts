import { ipcRenderer } from 'electron';
import { IpcChannels, CommunicationInterfaceTypesEnum, CommunicationInterfaceType } from '../../../@types/constants';

let selectedSessionNameElement: HTMLHeadingElement;
let interfaceNameElement: HTMLInputElement;
let interfaceTypeElement: HTMLSelectElement;
let ipNetworkSettingsContainer: HTMLDivElement;
let ipNetworkSettingsHostElement: HTMLInputElement;
let ipNetworkSettingsPortElement: HTMLInputElement;
let serialSettingsContainer: HTMLDivElement;
let serialPortNamesElement: HTMLSelectElement;
let createButton: HTMLButtonElement;
let cancelButton: HTMLButtonElement;

let initialData: CreateCommunicationInterfaceInitialData;

const init = () => {
  selectedSessionNameElement = document.getElementById('vc-selected-session-name') as HTMLHeadingElement;
  interfaceNameElement = document.getElementById('vc-iface-name') as HTMLInputElement;
  interfaceTypeElement = document.getElementById('vc-iface-type') as HTMLSelectElement;
  ipNetworkSettingsContainer = document.getElementById('vc-iface-settings-ip-network') as HTMLDivElement;
  ipNetworkSettingsHostElement = document.getElementById('vc-iface-settings-ip-network-host') as HTMLInputElement;
  ipNetworkSettingsPortElement = document.getElementById('vc-iface-settings-ip-network-port') as HTMLInputElement;
  serialSettingsContainer = document.getElementById('vc-iface-settings-serial') as HTMLDivElement;
  serialPortNamesElement = document.getElementById('vc-iface-settings-serial-portname') as HTMLSelectElement;
  createButton = document.getElementById('vc-iface-create-button') as HTMLButtonElement;
  cancelButton = document.getElementById('vc-iface-cancel-button') as HTMLButtonElement;

  ipNetworkSettingsContainer.classList.remove('collapse');
  serialSettingsContainer.classList.add('collapse');

  interfaceTypeElement.addEventListener('change', () => {
    if (interfaceTypeElement.selectedOptions.length <= 0) return;
    switch (interfaceTypeElement.selectedOptions[0].value) {
      case CommunicationInterfaceTypesEnum.Emulated:
        ipNetworkSettingsContainer.classList.add('collapse');
        serialSettingsContainer.classList.add('collapse');
        break;
      case CommunicationInterfaceTypesEnum.NationalInstrumentsGPIB:
        break;
      case CommunicationInterfaceTypesEnum.PrologixGPIBTCP:
        ipNetworkSettingsContainer.classList.remove('collapse');
        serialSettingsContainer.classList.add('collapse');
        break;
      case CommunicationInterfaceTypesEnum.PrologixGPIBUSB:
        ipNetworkSettingsContainer.classList.add('collapse');
        serialSettingsContainer.classList.remove('collapse');
        break;
      case CommunicationInterfaceTypesEnum.SerialPort:
        ipNetworkSettingsContainer.classList.add('collapse');
        serialSettingsContainer.classList.remove('collapse');
        break;
    }
  });

  ipcRenderer.on(IpcChannels.sessions.createCommunicationInterface.response, () => close());
  ipcRenderer.on(IpcChannels.sessions.createCommunicationInterface.error, (_, error: Error) => {
    alert(error.message);
    close();
  });

  ipcRenderer.on(IpcChannels.sessions.createCommunicationInterfaceInitialData, (_, data: CreateCommunicationInterfaceInitialData) => {
    initialData = data;
    selectedSessionNameElement.innerText = initialData.sessionName;
    const filteredCommIfaceTypes = initialData.communicationInterfaceTypes.filter(ciy => ciy !== CommunicationInterfaceTypesEnum.SerialPort && ciy !== CommunicationInterfaceTypesEnum.NationalInstrumentsGPIB);
    for (let index = 0; index < filteredCommIfaceTypes.length; index++) {
      const ifaceType = filteredCommIfaceTypes[index];
      const opt = document.createElement('option');
      opt.value = ifaceType;
      opt.text = ifaceType;
      interfaceTypeElement.options.add(opt);
    };
    interfaceTypeElement.selectedIndex = 0;

    data.serialPortNames.forEach(portName => {
      const opt = document.createElement('option');
      opt.value = portName;
      opt.text = portName;
      serialPortNamesElement.options.add(opt);
    });
    serialPortNamesElement.selectedIndex = 0;
  });

  createButton.addEventListener('click', () => {
    const iface: CommunicationInterfaceInfo = {
      name: interfaceNameElement.value,
      type: interfaceTypeElement.selectedOptions[0].value as CommunicationInterfaceType
    };
    switch (iface.type) {
      case CommunicationInterfaceTypesEnum.Emulated:
        break;
      case CommunicationInterfaceTypesEnum.NationalInstrumentsGPIB:
        break;
      case CommunicationInterfaceTypesEnum.PrologixGPIBTCP:
        iface.tcp = {
          host: ipNetworkSettingsHostElement.value,
          port: ipNetworkSettingsPortElement.valueAsNumber
        }
        break;
      case CommunicationInterfaceTypesEnum.PrologixGPIBUSB:
        iface.serial = {
          port: serialPortNamesElement.selectedOptions[0].value,
          baudRate: 9600
        }
        break;
      case CommunicationInterfaceTypesEnum.SerialPort:
        break;
    }
    ipcRenderer.send(IpcChannels.sessions.createCommunicationInterface.request, initialData.sessionName, iface);
  });

  cancelButton.addEventListener('click', () => {
    close();
  });

}

init();
