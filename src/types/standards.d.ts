export interface Category {
  name: string;
}

export interface RequiredStandard {
  identifier: string;
  categories: Category[];
}

export interface Asset extends RequiredStandard {
  assetId: string;
}

export interface RequiredStandardAssets {
  standard: RequiredStandard;
  assets: Asset[];
}
