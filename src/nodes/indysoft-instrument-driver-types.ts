import { CommandParameter, Instruction, InstructionSet } from 'visualcal-common/dist/driver-builder';
import { NodeRedRuntimeNode } from '../@types/logic-server';
import { NodeRedManager } from '../main/managers/NodeRedManager';
import { ConfigurationNode } from './indysoft-instrument-driver-configuration-types';

interface NodeRedNodeUIProperties {
  sectionConfigId?: string;
  name?: string;
  category: string;
  defaults: any;
  credentials?: any;
  inputs?: number;
  outputs?: number;
  color: string;
  paletteLabel?: string | any;
  label?: string | any;
  labelStyle?: string | any;
  inputLabels?: string[] | any;
  outputLabels?: string[] | any;
  icon?: string;
  align?: 'left' | 'right';
  button?: any;
  oneditprepare?: () => void;
  oneditsave?: () => void;
  oneditcancel?: () => void;
  oneditdelete?: () => void;
  oneditresize?: () => void;
  onpaletteadd?: () => void;
  onpaletteremove?: () => void;
}

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

export interface CustomDriverNodeRedRuntimeNode extends NodeRedRuntimeNode {
  driverConfigId: string;
  instructionSets: UIInstructionSet[];
  onBeforeWrite?: (data: string) => Promise<BeforeWriteResponse>;
}

export interface CustomDriverNodeUIProperties extends NodeRedNodeUIProperties {
  driverConfigId: string;
  instructionSets: UIInstructionSet[];
}

export const findCustomDriverConfigRuntimeNode = (node: CustomDriverNodeRedRuntimeNode) => {
  const foundConfig = NodeRedManager.instance.nodes.find(n => n.id === node.driverConfigId);
  if (!foundConfig) return foundConfig;
  return foundConfig.runtime as ConfigurationNode;
}