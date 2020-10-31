import { NodeRedRuntimeNode, NodeRedCommunicationInterfaceRuntimeNode, DeviceConfigurationNode } from '../../../@types/logic-server';
import { promises as fsPromises } from 'fs-extra';
import path from 'path';
import { DeviceNodeProperties } from '../../../@types/logic-nodes';
import { DriversPackageJson, DriversPackageJsonDriver } from '../../../@types/drivers-package-json';
import { DeviceManager, DriverName } from '../../managers/DeviceManager';
import { NodeRedManager } from '../../managers/NodeRedManager';

interface DeviceCommunicationInterfaceNamePair {
  deviceName: string;
  communicationInterfaceName: string;
  deviceDriver?: DeviceDriverInfo;
  isGpib?: boolean;
  gpibAddress: number;
}

let driversPackagejson: DriversPackageJson;
const deviceCommunicationInterfaces: DeviceCommunicationInterfaceNamePair[] = [];

const getCommunicationInterfaceForDevice = (deviceName: string) => {
  const pair = deviceCommunicationInterfaces.find(dci => dci.deviceName.toLowerCase() === deviceName.toLowerCase());
  if (!pair) return undefined;
  const ci = global.visualCal.communicationInterfaceManager.find(pair.communicationInterfaceName);
  return ci;
};

const clearDeviceCommunicationInterfaces = () => {
  deviceCommunicationInterfaces.length = 0;
};

const getDriverForDevice = (deviceName: string) => {
  const device = deviceCommunicationInterfaces.find(d => d.deviceName.toLocaleUpperCase() === deviceName.toUpperCase());
  if (!device || !device.deviceDriver) return null;
  const deviceDriver = driversPackagejson.visualcal.drivers.devices.find(d => d.manufacturer === device.deviceDriver?.manufacturer && d.model === device.deviceDriver.deviceModel);
  if (!deviceDriver) return null;
  return DeviceManager.instance.get(deviceDriver.displayName as DriverName, device.deviceName) as IControllableDevice;
};

const getDeviceConfig = (unitId: string) => {
  return deviceCommunicationInterfaces.find(d => d.deviceName === unitId);
}

const findNodesByDeviceConfigurationNode = (deviceConfigNodeId: string) => {
  const retVal: DeviceNodeProperties[] = [];
  NodeRedManager.instance.nodeRed.nodes.eachNode(node => {
    const nodeAny = node as DeviceNodeProperties;
    if (nodeAny.deviceConfigId === deviceConfigNodeId) retVal.push(nodeAny);
    return retVal;
  });
  return retVal;
};

const getDeviceConfigurationNodeInfosForCurrentFlow = () => {
  const retVal: DeviceNodeDriverRequirementsInfo[] = [];
  NodeRedManager.instance.nodeRed.nodes.eachNode((node) => {
    if (node.type === 'indysoft-device-configuration') {
      const configNode = node as DeviceConfigurationNode;
      const deviceNodes = findNodesByDeviceConfigurationNode(node.id);
      if (deviceNodes && deviceNodes.length > 0) {
        const firstDeviceNodeDefId = deviceNodes[0].deviceConfigId; // Only need the first since all device nodes are assumed to use a single device
        const firstDeviceNode = NodeRedManager.instance.nodeRed.nodes.getNode(firstDeviceNodeDefId) as NodeRedCommunicationInterfaceRuntimeNode;
        if (!firstDeviceNode) throw new Error(`Unable to locate node runtime for node id ${firstDeviceNodeDefId}`);
        const availableDrivers = getDriverInfosForDevice(configNode.unitId);
        const isGeneric = firstDeviceNode.deviceDriverRequiredCategories && firstDeviceNode.deviceDriverRequiredCategories.length > 0;
        retVal.push({
          configNodeId: configNode.id,
          unitId: configNode.unitId,
          driverCategories: isGeneric ? firstDeviceNode.deviceDriverRequiredCategories : undefined,
          availableDrivers: availableDrivers,
          isGeneric: isGeneric,
          isCustom: false
        });
      }
    }
  });
  return retVal;
};

const getDeviceDriverInfos = (opts?: { category: string; }) => {
  if (opts) return driversPackagejson.visualcal.drivers.devices.filter(d => d.categories.includes(opts.category));
  return driversPackagejson.visualcal.drivers.devices;
};

const getDriverInfosForDevice = (deviceName: string) => {
  const deviceConfigNode = findNodesByType('indysoft-device-configuration').find(node => (node as any).unitId.toUpperCase() === deviceName.toUpperCase());
  if (!deviceConfigNode) return [];
  const deviceOwners = findNodesByDeviceConfigurationNode(deviceConfigNode.id);
  if (!deviceOwners) return [];
  let deviceOwnerRuntimeNodes = deviceOwners.map(node => NodeRedManager.instance.nodeRed.nodes.getNode(node.id) as NodeRedCommunicationInterfaceRuntimeNode);
  if (!deviceOwnerRuntimeNodes) return [];

  const retVal: DriversPackageJsonDriver[] = [];
  const firstDeviceOwnerRuntimeNode = deviceOwnerRuntimeNodes[0];
  // First check if this is not a generic node
  if (!firstDeviceOwnerRuntimeNode.isGenericDevice && firstDeviceOwnerRuntimeNode.specificDriverInfo) {
    // Not a generic node
    const driverDisplayName = `${firstDeviceOwnerRuntimeNode.specificDriverInfo.manufacturer} ${firstDeviceOwnerRuntimeNode.specificDriverInfo.model}`;
    const packageJsonDriverInfo = driversPackagejson.visualcal.drivers.devices.find(dpj => dpj.displayName === driverDisplayName);
    if (!packageJsonDriverInfo) throw new Error(`Unable to locate specific driver, ${driverDisplayName}, in package.json for device node, ${firstDeviceOwnerRuntimeNode.type}`);
    retVal.push(packageJsonDriverInfo);
  } else {
    // Generic node
    deviceOwnerRuntimeNodes = deviceOwnerRuntimeNodes.filter(node => node.isGenericDevice);
    deviceOwnerRuntimeNodes.forEach(node => {
      node.deviceDriverRequiredCategories.forEach(category => {
        const driverInfos = getDeviceDriverInfos({ category });
        driverInfos.forEach(info => {
          const existingInfo = retVal.find(existing => info.displayName === existing.displayName);
          if (!existingInfo) retVal.push(info);
        });
      });
    });
  }

  return retVal;
};

const getAllNodes = (): NodeRedRuntimeNode[] => {
  const retVal: NodeRedRuntimeNode[] = [];
  NodeRedManager.instance.nodeRed.nodes.eachNode(np => {
    const n = NodeRedManager.instance.nodeRed.nodes.getNode(np.id) as NodeRedRuntimeNode;
    if (n && n.type !== 'tab') retVal.push(n);
  });
  return retVal;
};

const findNodesByType = (type: string): NodeRedRuntimeNode[] => {
  return getAllNodes().filter(n => n.type.toLowerCase() === type.toLowerCase());
};

const findNodeById = (id: string): NodeRedRuntimeNode | undefined => {
  return getAllNodes().find(n => n.id.toLowerCase() === id.toLowerCase());
};

/**
 * Gets the configuration node for a property of a host node
 * @param id The id of the node that hosts the configuration
 * @param configName The property name of the configuration id
 */
const getNodeConfig = (id: string, configName: string): NodeRedRuntimeNode | undefined => {
  const node = findNodeById(id);
  // eslint-disable-next-line
  const configId = (node as any)[configName] as string | undefined;
  if (!node || !configId) return undefined;
  return findNodeById(configId);
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
        gpibAddress: deviceConfig.gpibAddress,
        deviceDriver: undefined
      })
    } else {
      const drivers = getDriverInfosForDevice(deviceConfig.unitId);
      const driver = drivers.find(d => d.displayName = deviceConfig.driverDisplayName);
      if (!driver) throw new Error(`Could not find driver for ${deviceConfig.unitId}, ${deviceConfig.driverDisplayName}`);
      deviceCommunicationInterfaces.push({
        communicationInterfaceName: deviceConfig.interfaceName,
        deviceName: deviceConfig.unitId,
        isGpib: deviceConfig.gpib !== undefined,
        gpibAddress: deviceConfig.gpibAddress,
        deviceDriver: {
          categories: driver.categories,
          deviceModel: driver.model,
          manufacturer: driver.manufacturer
        }
      });
    }
    // const driverDisplayName = deviceConfig.driver ? `${deviceConfig.driver.manufacturer} ${deviceConfig.driver.deviceModel}` : '';
    // assignDriverToDevice(deviceConfig.unitId, driverDisplayName);
  });
}

const init = async () => {
  const driversPackagejsonPath = path.join(global.visualCal.dirs.drivers.base, 'package.json');
  const driversPackageJsonString = (await fsPromises.readFile(driversPackagejsonPath)).toString();
  driversPackagejson = JSON.parse(driversPackageJsonString);
};

// Support legacy IndySoft nodes that still util this util module
export default {
  init,
  getCommunicationInterfaceForDevice,
  getDriverForDevice,
  getDeviceConfig,
  getDeviceConfigurationNodeInfosForCurrentFlow,
  findNodeById,
  loadDevices
}
