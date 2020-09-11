import { NodeRedRuntimeNode, NodeRedCommunicationInterfaceRuntimeNode, NodeResetOptions, DeviceConfigurationNode } from '../../../@types/logic-server';
import { Node as NodeRedNode } from 'node-red';
import fs from 'fs-extra';
import path from 'path';
import { DeviceNodeProperties } from '../../../@types/logic-nodes';
import { Fluke5522A } from '../../../drivers/devices/multi-product-calibrators/Fluke5522ADevice';
import { Fluke45 } from '../../../drivers/devices/digital-multimeters/Fluke45';
import { Keysight34401A } from '../../../drivers/devices/digital-multimeters/Keysight34401A';
import { dialog } from 'electron';
import { DriversPackageJson, DriversPackageJsonDriver } from '../../../@types/drivers-package-json';
import NodeRed from '../index';

const nodeRed = NodeRed();

interface DeviceCommunicationInterfaceNamePair {
  deviceName: string;
  communicationInterfaceName: string;
  deviceDriver?: DeviceDriverInfo;
  isGpib?: boolean;
  gpibAddress: number;
}

let driversPackagejson: DriversPackageJson;
const deviceCommunicationInterfaces: DeviceCommunicationInterfaceNamePair[] = [];

export const onComment = (_source: NotificationSource, node: NodeRedNode, type: NotificationCommentType, comment: string) => {
  console.debug(`[global.visualCal.nodeRed.app.settings.onComment] [${node.type}] [${node.id}] [${type}] ${comment}`);
  if (type === 'error') {
    dialog.showErrorBox('An error occured', comment);
  }
};

export const getCommunicationInterfaceForDevice = (deviceName: string) => {
  const pair = deviceCommunicationInterfaces.find(dci => dci.deviceName.toLowerCase() === deviceName.toLowerCase());
  if (!pair) return undefined;
  const ci = global.visualCal.communicationInterfaceManager.find(pair.communicationInterfaceName);
  return ci;
};

const clearDeviceCommunicationInterfaces = () => {
  deviceCommunicationInterfaces.splice(0, deviceCommunicationInterfaces.length);
};

export const getDriverForDevice = async (deviceName: string) => {
  const device = deviceCommunicationInterfaces.find(d => d.deviceName.toLocaleUpperCase() === deviceName.toUpperCase());
  if (!device || !device.deviceDriver) return null;
  const deviceDriver = driversPackagejson.visualcal.drivers.devices.find(d => d.manufacturer === device.deviceDriver?.manufacturer && d.model === device.deviceDriver.deviceModel);
  if (!deviceDriver) return null;
  // const driverPath = path.join(config.dirBaseDrivers, deviceDriver.path);
  try {
    // const driver = await import(driverPath) as ControllableDevice;
    switch (deviceDriver.displayName) {
      case 'Fluke 45':
        return new Fluke45();
      case 'Keysight 34401A':
        return new Keysight34401A();
      case 'Fluke 5522A':
        return new Fluke5522A();
    }
    return null;
  } catch (error) {
    console.error('Attempted to locate device driver', error);
    return null;
  }
  // // TODO: Need to return a driver
  // const tempDriver = new Fluke5522A();
  // // const iface = getCommunicationInterfaceForDevice(deviceName);
  // // if (!iface) throw new Error('No communication interface found for device');
  // const iface = new EmulatedCommunicationInterface();
  // tempDriver.setCommunicationInterface(iface);
  // return tempDriver;
};

const findDeviceConfigurationNodeOwners = (configNodeId: string) => {
  const retVal: DeviceNodeProperties[] = [];
  global.visualCal.nodeRed.app.nodes.eachNode(node => {
    const nodeAny = node as DeviceNodeProperties;
    if (nodeAny.deviceConfigId === configNodeId) retVal.push(nodeAny);
    return retVal;
  });
  return retVal;
};

export const getDeviceConfigurationNodeInfosForCurrentFlow = () => {
  const retVal: DeviceNodeDriverRequirementsInfo[] = [];
  global.visualCal.nodeRed.app.nodes.eachNode((node) => {
    if (node.type === 'indysoft-device-configuration') {
      const configNode = node as DeviceConfigurationNode;
      const deviceNodes = findDeviceConfigurationNodeOwners(node.id);
      if (deviceNodes && deviceNodes.length > 0) {
        const firstDeviceNodeDefId = deviceNodes[0].deviceConfigId; // Only need the first since all device nodes are assumed to use a single device
        const firstDeviceNode = global.visualCal.nodeRed.app.nodes.getNode(firstDeviceNodeDefId) as NodeRedCommunicationInterfaceRuntimeNode;
        if (!firstDeviceNode) throw new Error(`Unable to locate node runtime for node id ${firstDeviceNodeDefId}`);
        const availableDrivers = getDriverInfosForDevice(configNode.unitId);
        const isGeneric = firstDeviceNode.deviceDriverRequiredCategories && firstDeviceNode.deviceDriverRequiredCategories.length > 0;
        retVal.push({
          configNodeId: configNode.id,
          unitId: configNode.unitId,
          driverCategories: isGeneric ? firstDeviceNode.deviceDriverRequiredCategories : undefined,
          availableDrivers: availableDrivers,
          isGeneric: isGeneric
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
  const deviceOwners = findDeviceConfigurationNodeOwners(deviceConfigNode.id);
  if (!deviceOwners) return [];
  let deviceOwnerRuntimeNodes = deviceOwners.map(node => global.visualCal.nodeRed.app.nodes.getNode(node.id) as NodeRedCommunicationInterfaceRuntimeNode);
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

export const getAllNodes = (): NodeRedRuntimeNode[] => {
  const retVal: NodeRedRuntimeNode[] = [];
  global.visualCal.nodeRed.app.nodes.eachNode(np => {
    const n = global.visualCal.nodeRed.app.nodes.getNode(np.id) as NodeRedRuntimeNode;
    if (n && n.type !== 'tab') retVal.push(n);
  });
  return retVal;
};

export const findNodesByType = (type: string): NodeRedRuntimeNode[] => {
  return getAllNodes().filter(n => n.type.toLowerCase() === type.toLowerCase());
};

export const findNodeById = (id: string): NodeRedRuntimeNode | undefined => {
  return getAllNodes().find(n => n.id.toLowerCase() === id.toLowerCase());
};

/**
 * Gets the configuration node for a property of a host node
 * @param id The id of the node that hosts the configuration
 * @param configName The property name of the configuration id
 */
export const getNodeConfig = (id: string, configName: string): NodeRedRuntimeNode | undefined => {
  const node = findNodeById(id);
  // eslint-disable-next-line
  const configId = (node as any)[configName] as string | undefined;
  if (!node || !configId) return undefined;
  return findNodeById(configId);
};

export const resetAllConnectedNodes = (startFrom: NodeRedRuntimeNode, options?: NodeResetOptions) => {
  if (options && options.targetId !== startFrom.id) return;
  if (!startFrom.wires) return;
  startFrom.wires.forEach(nodeId => {
    const currentNode = global.visualCal.nodeRed.app.nodes.getNode(nodeId);
    if (currentNode) {
      currentNode.emit('reset');
      resetAllConnectedNodes(currentNode, options);
    }
  });
};

/**
 * Resets all instruction nodes (indysoft-instruction-, and currently indysoft-dialog-)
 * @param startFrom Node to start resetting from, not including this node
 */
export const resetConnectedInstructionNodes = (startFrom: NodeRedRuntimeNode) => {
  if (!startFrom.wires) return;
  startFrom.wires.forEach(nodeId => {
    const currentNode = global.visualCal.nodeRed.app.nodes.getNode(nodeId);
    if (currentNode) {
      if (currentNode.type.startsWith('indysoft-instruction') || currentNode.type.startsWith('indysoft-dialog')) currentNode.emit('reset');
      resetConnectedInstructionNodes(currentNode);
    }
  });
};

export const getProcedureStatus = () => {
  const procedureNode = nodeRed.visualCalProcedureSidebarNode;
  if (!procedureNode) return null;
  const status: ProcedureStatus = {
    name: procedureNode.runtime.name,
    shortName: procedureNode.runtime.shortName,
    sections: []
  };
  const sectionNodes = nodeRed.visualCalSectionConfigurationNodes;
  sectionNodes.forEach(sectionNode => {
    const actionStatuses: ActionStatus[] = [];
    const actionNodesForSection = nodeRed.getVisualCalActionStartNodesForSection(sectionNode.runtime.shortName);
    actionNodesForSection.forEach(actionNode => {
      if (actionNode) actionStatuses.push({
        name: actionNode.runtime.name,
        isRunning: actionNode.runtime.isRunning
      });
    });
    status.sections.push({
      name: sectionNode.runtime.name,
      shortName: sectionNode.runtime.shortName,
      actions: actionStatuses
    });
  });
  return status;
};

export const loadDevices = (session: Session) => {
  clearDeviceCommunicationInterfaces();
  if (!session.configuration) throw new Error(`Session, ${session.name} does not have a configuration`);
  session.configuration.devices.forEach(deviceConfig => {
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
    // const driverDisplayName = deviceConfig.driver ? `${deviceConfig.driver.manufacturer} ${deviceConfig.driver.deviceModel}` : '';
    // assignDriverToDevice(deviceConfig.unitId, driverDisplayName);
  });
}

export const init = () => {
  const driversPackagejsonPath = path.join(global.visualCal.dirs.drivers.base, 'package.json');
  driversPackagejson = fs.readJSONSync(driversPackagejsonPath);
};

export const getDeviceConfig = (unitId: string) => {
  return deviceCommunicationInterfaces.find(d => d.deviceName === unitId);
}
