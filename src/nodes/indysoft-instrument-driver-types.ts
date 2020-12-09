import { CommandParameter, Instruction, InstructionSet } from 'visualcal-common/dist/driver-builder';
import { NodeRedRuntimeNode } from '../@types/logic-server';
import { NodeRedFlowNode } from '../@types/node-red-info';
import { NodeRedManager } from '../main/managers/NodeRedManager';
import { ConfigurationNode } from './indysoft-instrument-driver-configuration-types';

export const TypeName = 'indysoft-instrument-driver';

export type TypedInputType = 'msg' | 'flow' | 'global' | 'str' | 'num' | 'bool' | 'json' | 'bin' | 're' | 'date' | 'env' | 'jsonata';

export interface UIInstructionCommandParameterArgument {
  instructionId: string;
  parameter: CommandParameter;
  value: string | number | boolean;
  typedInputType?: TypedInputType;
}

export interface UIInstructionSet {
  id: string;
  instructionSet: InstructionSet;
  preParameterArguments?: UIInstructionCommandParameterArgument[];
  postParameterArguments?: UIInstructionCommandParameterArgument[];
}

export interface InstructionResponse {
  instruction: Instruction;
  raw: string | number | ArrayBufferLike | boolean;
  value: string | number | ArrayBufferLike | boolean;
}

export type BeforeWriteResponse = { data: string, cancel?: boolean };

export interface RuntimeNode extends NodeRedRuntimeNode {
  driverConfigId: string;
  instructionSets: UIInstructionSet[];
  onBeforeWrite?: (data: string) => Promise<BeforeWriteResponse>;
}

export interface ConfigurationProperties extends NodeRedFlowNode {
  driverConfigId: string;
  instructionSets: UIInstructionSet[];
}

export const findCustomDriverConfigRuntimeNode = (node: RuntimeNode) => {
  const foundConfig = NodeRedManager.instance.nodes.find(n => n.id === node.driverConfigId);
  if (!foundConfig) return foundConfig;
  return foundConfig.runtime as ConfigurationNode;
}