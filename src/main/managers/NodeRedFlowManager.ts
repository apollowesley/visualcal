import { EventEmitter } from 'events';
import fs, { promises as fsPromises } from 'fs';
import { ProcedureManager } from './ProcedureManager';
import path from 'path';
import { NodeRedFlow } from '../../@types/node-red-info';
import { clearCommunicationInterfaces, addCommunicationInterface } from '../node-red/utils';
import { CommunicationInterface } from '../../drivers/communication-interfaces/CommunicationInterface';
import { EmulatedCommunicationInterface } from '../../drivers/communication-interfaces/EmulatedCommunicationInterface';
import { PrologixGpibTcpInterface } from '../../drivers/communication-interfaces/prologix/PrologixGpibTcpInterface';
import { PrologixGpibUsbInterface } from '../../drivers/communication-interfaces/prologix/PrologixGpibUsbInterface';

export class NodeRedFlowManager extends EventEmitter {

  constructor() {
    super();
  }

  async load(session: Session) {
    const procDirPath = ProcedureManager.getProcedureDirPath(session.procedureName);
    const logicDirPath = path.join(procDirPath, 'logic');
    const flowFilePath = path.join(logicDirPath, 'flows.json');
    if (!fs.existsSync(flowFilePath)) throw new Error(`Unable to locate flow file for procedure, ${session.procedureName}`);
    const flowFileContentBuffer = await fsPromises.readFile(flowFilePath);
    const flowFileContents = JSON.parse(flowFileContentBuffer.toString()) as NodeRedFlow;
    const nodeRedEditorWindowWasOpen = global.visualCal.windowManager.nodeRedEditorWindow !== undefined;
    if (nodeRedEditorWindowWasOpen && global.visualCal.windowManager.nodeRedEditorWindow) {
      try {
        global.visualCal.windowManager.nodeRedEditorWindow.close();
      } catch (error) {
        console.error(error);
      }
      if (global.visualCal.windowManager.nodeRedEditorWindow) {
        try {
          global.visualCal.windowManager.nodeRedEditorWindow.destroy();
        } catch (error) {
          console.error(error);
        }
      }
    }
    try {
      await global.visualCal.nodeRed.app.runtime.flows.setFlows({ flows: { flows: flowFileContents }, user: 'server' }, 'full');
      clearCommunicationInterfaces();
      if (session.configuration) {
        session.configuration.interfaces.forEach(ifaceInfo => {
          let iface: CommunicationInterface | null = null;
          switch (ifaceInfo.type) {
            case 'Emulated':
              iface = new EmulatedCommunicationInterface();
              break;
            case 'Prologix GPIB TCP':
              iface = new PrologixGpibTcpInterface();
              const prologixTcpIface = iface as PrologixGpibTcpInterface;
              if (!ifaceInfo.tcp) throw new Error('TCP communiation interface configuration is missing');
              prologixTcpIface.configure({
                id: ifaceInfo.name,
                host: ifaceInfo.tcp.host,
                port: ifaceInfo.tcp.port
              });
              break;
            case 'Prologix GPIB USB':
              iface = new PrologixGpibUsbInterface();
              const prologixUcbIface = iface as PrologixGpibUsbInterface;
              if (!ifaceInfo.serial) throw new Error('Serial communiation interface configuration is missing');
              prologixUcbIface.configure({
                id: ifaceInfo.name,
                portName: ifaceInfo.serial.port
              });
              break;
          }
          if (!iface) throw new Error('Communication interface cannot be null');
          addCommunicationInterface({
            name: ifaceInfo.name,
            communicationInterface: iface
          });
        });
      }
    } catch (error) {
      console.error(error);
    }
    if (nodeRedEditorWindowWasOpen) await global.visualCal.windowManager.ShowNodeRedEditor();
  }

}