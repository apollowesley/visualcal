import { EventEmitter } from 'events';
import fs, { promises as fsPromises } from 'fs';
import { ProcedureManager } from './ProcedureManager';
import path from 'path';
import { NodeRedFlow } from '../../@types/node-red-info';

export class NodeRedFlowManager extends EventEmitter {

  constructor() {
    super();
  }

  async load(procedureName: string) {
    const procDirPath = ProcedureManager.getProcedureDirPath(procedureName);
    const logicDirPath = path.join(procDirPath, 'logic');
    const flowFilePath = path.join(logicDirPath, 'flows.json');
    if (!fs.existsSync(flowFilePath)) throw new Error(`Unable to locate flow file for procedure, ${procedureName}`);
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
      await global.visualCal.nodeRed.runtime.flows.setFlows({ flows: { flows: flowFileContents }, user: 'server' }, 'full');
    } catch (error) {
      console.error(error);
    }
    if (nodeRedEditorWindowWasOpen) await global.visualCal.windowManager.ShowNodeRedEditor();
  }

}