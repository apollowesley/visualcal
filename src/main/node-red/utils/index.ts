import { NodeRedRuntimeNode, NodeRedCommunicationInterfaceRuntimeNode, DeviceConfigurationNode } from '../../../@types/logic-server';
import { NodeRedManager } from '../../managers/NodeRedManager';
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

const getAllNodes = (): NodeRedRuntimeNode[] => {
  const retVal: NodeRedRuntimeNode[] = [];
  NodeRedManager.instance.nodeRed.nodes.eachNode(np => {
    const n = NodeRedManager.instance.nodeRed.nodes.getNode(np.id) as NodeRedRuntimeNode;
    if (n && n.type !== 'tab') retVal.push(n);
  });
  return retVal;
};

const findNodeById = (id: string): NodeRedRuntimeNode | undefined => {
  return getAllNodes().find(n => n.id.toLowerCase() === id.toLowerCase());
};

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
    // const driverDisplayName = deviceConfig.driver ? `${deviceConfig.driver.manufacturer} ${deviceConfig.driver.deviceModel}` : '';
    // assignDriverToDevice(deviceConfig.unitId, driverDisplayName);
  });
}

// Support legacy IndySoft nodes that still util this util module
export default {
  getCommunicationInterfaceForDevice,
  getDeviceConfig,
  findNodeById,
  loadDevices
}
