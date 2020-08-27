import { NodeRedRuntimeNode } from '../../@types/logic-server';
import { NodeRedFlowNode } from '../../@types/node-red-info';

export type DeployType = 'full';

export interface NodeRedNode {
  id: string;
  type: string;
  editorDefinition: NodeRedFlowNode;
  runtime: NodeRedRuntimeNode;
}

export interface NodeRedTypedNode<TEditorType extends NodeRedFlowNode, TRuntimeType extends NodeRedRuntimeNode> {
  id: string;
  type: string;
  editorDefinition: TEditorType;
  runtime: TRuntimeType;
}
