interface Category {
  name: string;
}

interface RequiredStandard {
  identifier: string;
  categories: Category[];
}

interface Asset extends RequiredStandard {
  assetId: string;
}

interface RequiredStandardAssets {
  standard: RequiredStandard;
  assets: Asset[];
}
