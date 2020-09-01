import { OnEditPrepareThis as OriginalOnEditPrepareThis } from '..';

export type Type = 'command' | 'delay' | 'reset' | 'trigger';
export type CommandType = 'read' | 'write' | 'query';
export type ResetType = 'device' | 'interface';
export type DataType = 'string' | 'integer' | 'byteArray' | 'float32' | 'float64';

export interface Operation {
  unitId: string;
  unitIdPropertyType: NodeRedUIPropertyType;
  interfaceIdPropertyType: NodeRedUIPropertyType;
  writeDataPropertyType: NodeRedUIPropertyType;
  readDataTypePropertyType: NodeRedUIPropertyType;
  responseTagPropertyType: NodeRedUIPropertyType;
  delayPropertyType: NodeRedUIPropertyType;
  type: Type;
  commandType: CommandType;
  readDataType?: DataType;
  useReadLength?: boolean;
  readLength?: number;
  responseTag?: string;
  writeData?: string;
  delay: number;
  resetType?: ResetType;
  interfaceId?: string;
  writeDataType?: DataType
}

export interface TypeSelectFieldOptions {
  label: string,
  value: Type | string;
}

export interface OnEditPrepareThis extends OriginalOnEditPrepareThis {
  operations?: Operation[];
}
