import { EventEmitter } from 'events';
import fs, { promises as fsPromises } from 'fs';
import { ProcedureManager } from './ProcedureManager';
import path from 'path';
import { NodeRedFlow } from '../../@types/node-red-info';
import { loadCommunicationConfiguration } from '../node-red/utils';

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
      loadCommunicationConfiguration(session);
    } catch (error) {
      console.error(error);
    }
    if (nodeRedEditorWindowWasOpen) await global.visualCal.windowManager.ShowNodeRedEditor();
  }

}