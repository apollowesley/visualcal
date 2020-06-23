import { Node as NodeRedNode } from 'node-red';

export const IS_RUNNING = 'isRunning';
export const IS_CANCELED = 'isCanceled';
export const REGISTER_ACTION_HANDLER = 'registerActionHandler';


export function getIsProcedureActionRunning(node: NodeRedNode): boolean {
  return node.context().global.isRunning;
}

export function getIsProcedureActionCanceled(node: NodeRedNode): boolean {
  return node.context().global.isCanceled;
}

export function setIsProcedureActionRunning(node: NodeRedNode, value: boolean): void {
  node.context().global.set(IS_RUNNING, value);
}

export function getFlowSectionName(node: NodeRedNode): string | undefined {
  return node.context().flow.get('section');
}

export function setIsProcedureActionCanceled(node: NodeRedNode, value: boolean): void {
  node.context().global.set(IS_CANCELED, value);
}

export function startProcedureAction(node: NodeRedNode): void {
  setIsProcedureActionCanceled(node, false);
  setIsProcedureActionRunning(node, true);
}

export function stopProcedureAction(node: NodeRedNode): void {
  setIsProcedureActionCanceled(node, true);
  setIsProcedureActionRunning(node, false);
}

export function resetProcedureActionStatus(node: NodeRedNode): void {
  setIsProcedureActionRunning(node, false);
  setIsProcedureActionCanceled(node, false);
}
