import { NodeRedNodeUIProperties } from '..';

export type DataType = 'none' | 'integer' | 'float' | 'string';

export interface IndySoftUserInputUIProperties extends NodeRedNodeUIProperties {
  title?: string;
  dataType?: DataType;
}
