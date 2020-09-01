import { NodeRedNodeUIProperties, OnEditPrepareThis as OriginalOnEditPrepareThis } from '..';

export type DataType = 'none' | 'integer' | 'float' | 'string';

export interface IndySoftUserInputUIProperties extends NodeRedNodeUIProperties {
  title: string;
  dataType: DataType;
}

export interface OnEditPrepareThis extends OriginalOnEditPrepareThis {
  title?: string;
  dataType?: DataType;
}
