interface Section {
  name: string;
}

interface Procedure {
  name: string;
  sections: Section[];
}

declare type TreeItemType = 'procedure' | 'procedure-section';

interface TreeItem {
  name: string;
  type: TreeItemType;
  children?: TreeItem[];
}
