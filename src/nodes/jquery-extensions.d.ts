interface NodeRedEditableListOptions<TData> {
  addButton?: boolean | string;
  addItem?: (row: JQuery<HTMLLIElement>, index: number, data: TData | {}) => void;
  connectWith?: string;
  header?: JQuery<HTMLElement>;
  height?: string | number;
  filter?: (data: TData) => boolean;
  resize?: () => void;
  resizeItem?: (row: HTMLElement, index: number) => void;
  scrollOnAdd?: boolean;
  sort?: (itemDataA: TData, itemDataB: TData) => number;
  sortable?: boolean | string;
  sortItems?: (items: HTMLElement) => void;
  removable?: boolean;
  removeItem?: (data: TData) => void;
}

interface JQuery<TElement = HTMLElement> {
  editableList<TData>(options: NodeRedEditableListOptions<TData>): JQuery<TElement>;
  editableList<TData>(method: 'addItem', itemData: TData): JQuery<TElement>;
  editableList<TData>(method: 'addItems', itemData: TData[]): JQuery<TElement>;
  editableList<TData>(method: 'removeItem', itemData: TData): JQuery<TElement>;
  editableList<TData>(method: 'width', width: string | number): JQuery<TElement>;
  editableList<TData>(method: 'height', height: string | number): JQuery<TElement>;
  editableList<TData>(method: 'items'): JQuery<HTMLElement>[];
  editableList<TData>(method: 'empty'): JQuery<TElement>;
  editableList<TData>(method: 'filter', filter?: (data: TData) => number): number;
  editableList<TData>(method: 'show', item: TData): JQuery<TElement>;
  editableList<TData>(method: 'sort', sort?: (itemDataA: TData, itemDataB: TData) => number): JQuery<TElement>;
  editableList<TData>(method: 'length'): number;
}
