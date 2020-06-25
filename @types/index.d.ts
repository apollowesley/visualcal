declare type TreeItemType = 'procedure' | 'procedure-section';

interface TreeItem {
  name: string;
  type: TreeItemType;
  children?: TreeItem[];
}
