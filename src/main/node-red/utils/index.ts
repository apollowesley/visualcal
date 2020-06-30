import { NodeRed, NodeRedRuntimeNode, NodeRedCommunicationInterfaceRuntimeNode, NodeResetOptions, ProcedureRuntimeNode, SectionRuntimeNode, ActionStartRuntimeNode } from '../../../@types/logic-server';
import { CommunicationInterface } from '../../../drivers/communication-interfaces/CommunicationInterface';
import { Node as NodeRedNode } from 'node-red';
import fs from 'fs-extra';
import path from 'path';
import { DeviceNodeProperties } from '../../../@types/logic-nodes';
import { Fluke5522A } from '../../../drivers/devices/multi-product-calibrators/Fluke5522ADevice';
import { Fluke45 } from '../../../drivers/devices/digital-multimeters/Fluke45';
import { Keysight34401A } from '../../../drivers/devices/digital-multimeters/Keysight34401A';
import { EventNames } from '../../../@types/constants';

interface DriversPackageJsonInterface {
  displayName: string;
  class: string;
  path: string;
}

interface DriversPackageJsonDriver {
  displayName: string;
  class: string;
  manufacturer: string;
  model: string;
  categories: string[];
  path: string;
}

interface DriversPackageJsonVisualCalDrivers {
  interfaces: DriversPackageJsonInterface[];
  devices: DriversPackageJsonDriver[];
}

interface DriversPackageJsonVisualCal {
  drivers: DriversPackageJsonVisualCalDrivers;
}

interface DriversPackageJson {
  visualcal: DriversPackageJsonVisualCal;
}

export interface CommunicationInterfaceNamePair {
  name: string;
  communicationInterface: CommunicationInterface;
}

export interface DeviceCommunicationInterfaceNamePair {
  deviceName: string;
  communicationInterfaceName: string;
  deviceDriver?: DeviceDriver;
}


let driversPackagejson: DriversPackageJson;
const communicationInterfaces: CommunicationInterfaceNamePair[] = [];
const deviceCommunicationInterfaces: DeviceCommunicationInterfaceNamePair[] = [];

export const onActionStateChange = (node: NodeRedNode, options: NotifiyFrontendActionStateChangeOptions) => {
  global.visualCal.nodeRed.app.events.emit('comms', { topic: 'visualcal', data: { type: 'action', state: options.state, section: options.section, action: options.action } });
  console.debug(`[global.visualCal.nodeRed.app.settings.onActionStateChange] [${node.type}] [${node.id}] [action] [section: ${options.section}] [action: ${options.action}] [state: ${options.state}]`);
};

export const onActionResult = async (options: NotifyFrontendActionResultOptions) => {
  global.visualCal.resultManager.saveOne(options.result.sessionId, options.result);
};

export const onShowInstruction = (node: NodeRedNode, options: InstructionRequest) => {
  global.visualCal.nodeRed.app.events.emit('comms', { topic: 'visualcal', data: options });
  global.visualCal.userInteractionManager.showInstruction(options);
  console.debug(`[global.visualCal.nodeRed.app.settings.onShowTextDialog] [${node.type}] [${node.id}] [section: ${options.section}] [action: ${options.action}] [title: ${options.title}] [text: ${options.text}]`);
};

export const onGetUserInput = (node: NodeRedNode, options: UserInputRequest) => {
  global.visualCal.nodeRed.app.events.emit('comms', { topic: 'visualcal', data: options });
  global.visualCal.userInteractionManager.showInput(options);
  console.debug(`[global.visualCal.nodeRed.app.settings.onShowTextDialog] [${node.type}] [${node.id}] [section: ${options.section}] [action: ${options.action}] [dataType: ${options.dataType}]`);
};

export const onComment = (source: NotificationSource, node: NodeRedNode, type: NotificationCommentType, comment: string) => {
  global.visualCal.nodeRed.app.events.emit('comms', { topic: 'visualcal', data: { source: source, type: 'comment', nodeId: node.id, nodeType: node.type, commentType: type, comment: comment } });
  console.debug(`[global.visualCal.nodeRed.app.settings.onComment] [${node.type}] [${node.id}] [${type}] ${comment}`);
};

export const getCommunicationInterface = (name: string) => {
  const pair = communicationInterfaces.find(ci => ci.name.toLowerCase() === name.toLowerCase());
  if (pair) return pair.communicationInterface;
  return undefined;
};

export const addCommunicationInterface = (options: { name: string; communicationInterface: CommunicationInterface }) => {
  const existingIface = getCommunicationInterface(options.name);
  if (existingIface) return false;
  communicationInterfaces.push(options);
  return true;
};

export const clearCommunicationInterfaces = () => {
  communicationInterfaces.forEach(ci => {
    try {
      ci.communicationInterface.disconnect();
      // TODO: Add removeAllListeners and destroy methods to CommunicationInterface
    } catch (error) {
      console.error(error);
    }
  });
  communicationInterfaces.splice(0, communicationInterfaces.length);
};

export const getCommunicationInterfaceForDevice = (deviceName: string) => {
  const pair = deviceCommunicationInterfaces.find(dci => dci.deviceName.toLowerCase() === deviceName.toLowerCase());
  if (!pair) return undefined;
  const ci = getCommunicationInterface(pair.communicationInterfaceName);
  return ci;
};

export const addCommunicationInterfaceForDevice = (options: DeviceCommunicationInterfaceNamePair) => {
  const existing = getCommunicationInterfaceForDevice(options.deviceName);
  if (existing) return false;
  deviceCommunicationInterfaces.push(options);
  return true;
};

export const clearDeviceCommunicationInterfaces = () => {
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

export const findDeviceConfigurationNodeOwners = (configNodeId: string) => {
  const retVal: DeviceNodeProperties[] = [];
  global.visualCal.nodeRed.app.nodes.eachNode(node => {
    const nodeAny = node as DeviceNodeProperties;
    if (nodeAny.deviceConfigId === configNodeId) retVal.push(nodeAny);
    return retVal;
  });
  return retVal;
};

export const assignDriverToDevice = (deviceName: string, driverDisplayName: string) => {
  const driverInfo = driversPackagejson.visualcal.drivers.devices.find(d => d.displayName === driverDisplayName);
  if (!driverInfo) throw new Error(`Driver not found: ${driverDisplayName}`);
  const device = deviceCommunicationInterfaces.find(d => d.deviceName === deviceName);
  if (!device) throw new Error(`Device not found: ${deviceName}`);
  device.deviceDriver = {
    manufacturer: driverInfo.manufacturer,
    deviceModel: driverInfo.model,
    categories: driverInfo.categories
  };
};

export const getDeviceDriverCategories = () => {
  const flatDevices = driversPackagejson.visualcal.drivers.devices.flatMap(d => d.categories);
  return flatDevices.filter((item, index) => flatDevices.indexOf(item) === index);
};

export const getDeviceDriverInfos = (opts?: { category: string }) => {
  if (opts) return driversPackagejson.visualcal.drivers.devices.filter(d => d.categories.includes(opts.category));
  return driversPackagejson.visualcal.drivers.devices;
};

export const getDriverInfosForDevice = (deviceName: string) => {
  const device = deviceCommunicationInterfaces.find(d => d.deviceName.toLocaleUpperCase() === deviceName.toUpperCase());
  if (!device) return [];
  const deviceConfigNode = findNodesByType('indysoft-device-configuration').find(node => (node as any).unitId.toUpperCase() === deviceName.toUpperCase());
  if (!deviceConfigNode) return [];
  const deviceOwners = findDeviceConfigurationNodeOwners(deviceConfigNode.id);
  if (!deviceOwners) return [];
  let deviceOwnerRuntimeNodes = deviceOwners.map(node => global.visualCal.nodeRed.app.nodes.getNode(node.id) as NodeRedCommunicationInterfaceRuntimeNode);
  if (!deviceOwnerRuntimeNodes) return [];
  deviceOwnerRuntimeNodes = deviceOwnerRuntimeNodes.filter(node => node.isGenericDevice);
  const retVal: DriversPackageJsonDriver[] = [];
  deviceOwnerRuntimeNodes.forEach(node => {
    node.deviceDriverRequiredCategories.forEach(category => {
      const driverInfos = getDeviceDriverInfos({ category });
      driverInfos.forEach(info => {
        const existingInfo = retVal.find(existing => info.displayName === existing.displayName);
        if (!existingInfo) retVal.push(info);
      });
    });
  });
  return retVal;
};

export const getInterfaceDriverInfos = () => {
  return driversPackagejson.visualcal.drivers.devices;
};

export const resetAllNodes = () => {
  global.visualCal.nodeRed.app.runtime.events.emit('reset');
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

export const getProcedureNode = () => {
  const procedureConfigNode = findNodesByType('procedure-sidebar') as ProcedureRuntimeNode[];
  if (procedureConfigNode.length > 0) return procedureConfigNode[0];
  return null;
};

export const getSectionNodes = () => {
  const sectionConfigNodes = findNodesByType('indysoft-section-configuration') as SectionRuntimeNode[];
  return sectionConfigNodes;
};

export const getActionNodesForSection = (sectionShortName: string) => {
  const validStartActionNodes = (findNodesByType('indysoft-action-start').filter(n => n !== undefined && n !== null && (n as ActionStartRuntimeNode).section) as ActionStartRuntimeNode[]).filter(n => n.section && n.section.shortName.toLowerCase() === sectionShortName.toLowerCase());
  if (!validStartActionNodes) return [];
  return validStartActionNodes;
};

export const getProcedureStatus = () => {
  const procedureNode = getProcedureNode();
  if (!procedureNode) return null;
  const status: ProcedureStatus = {
    name: procedureNode.name,
    shortName: procedureNode.shortName,
    sections: []
  };
  const sectionNodes = getSectionNodes();
  sectionNodes.forEach(sectionNode => {
    const actionStatuses: ActionStatus[] = [];
    const actionNodesForSection = getActionNodesForSection(sectionNode.shortName);
    actionNodesForSection.forEach(actionNode => {
      if (actionNode) actionStatuses.push({
        name: actionNode.name,
        isRunning: actionNode.isRunning
      });
    });
    status.sections.push({
      name: sectionNode.name,
      shortName: sectionNode.shortName,
      actions: actionStatuses
    });
  });
  return status;
};

export const enableAllCommunicationInterfaces = () => {
  communicationInterfaces.forEach(ci => ci.communicationInterface.enable());
};

export const disableAllCommunicationInterfaces = () => {
  communicationInterfaces.forEach(ci => ci.communicationInterface.disable());
};

export const init = () => {
  const driversPackagejsonPath = path.join(global.visualCal.dirs.drivers.base, 'package.json');
  driversPackagejson = fs.readJSONSync(driversPackagejsonPath);
};
