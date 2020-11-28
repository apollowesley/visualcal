import { CommunicationInterfaceManager } from '../../managers/CommunicationInterfaceManager';

interface DeviceCommunicationInterfaceNamePair {
  deviceName: string;
  communicationInterfaceName: string;
  isGpib?: boolean;
  gpibAddress: number;
}

const deviceCommunicationInterfaces: DeviceCommunicationInterfaceNamePair[] = [];

const getCommunicationInterfaceForDevice = (deviceName: string) => {
  const pair = deviceCommunicationInterfaces.find(dci => dci.deviceName.toLowerCase() === deviceName.toLowerCase());
  if (!pair) return undefined;
  const ci = CommunicationInterfaceManager.instance.find(pair.communicationInterfaceName);
  return ci;
};

const clearDeviceCommunicationInterfaces = () => {
  deviceCommunicationInterfaces.length = 0;
};

const getDeviceConfig = (unitId: string) => {
  return deviceCommunicationInterfaces.find(d => d.deviceName === unitId);
}

const loadDevices = (session: Session) => {
  clearDeviceCommunicationInterfaces();
  if (!session.configuration) throw new Error(`Session, ${session.name} does not have a configuration`);
  session.configuration.devices.forEach(deviceConfig => {
    if (deviceConfig.isCustom) {
      deviceCommunicationInterfaces.push({
        communicationInterfaceName: deviceConfig.interfaceName,
        deviceName: deviceConfig.unitId,
        isGpib: deviceConfig.gpib !== undefined,
        gpibAddress: deviceConfig.gpibAddress
      })
    }
  });
}

// Support legacy IndySoft nodes that still util this util module
export default {
  getCommunicationInterfaceForDevice,
  getDeviceConfig,
  loadDevices
}
