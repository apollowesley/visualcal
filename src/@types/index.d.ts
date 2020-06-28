interface CreateWindowOptions extends VisualCalWindowOptions {
  config?: import('electron').BrowserWindowConstructorOptions;
}

declare type TreeItemType = 'procedure' | 'procedure-section';

interface TreeItem {
  name: string;
  type: TreeItemType;
  children?: TreeItem[];
}
