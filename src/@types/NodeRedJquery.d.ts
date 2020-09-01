interface NodeRedEditiableListElementOptions<TData> {
  /**
   * Determines whether a button is shown below the list that, when clicked, will add a new entry to the list.
   * 
   * If not specified, or set to true (boolean) a button is shown with the text ‘Add’.
   * 
   * If set to false (boolean), the button is not shown.
   * 
   * If set to a non-blank string, a button is shown using its value as the text of the button.
   */
  addButton?: string | boolean;
  /**
   * Called when a new item is being added to the list
   */
  addItem?: ((row: JQuery<HTMLDivElement>, index: number, data: TData) => void);
  /**
   * If the list is sortable, this option allows items to be dragged from this list to any other jQuery sortable list, such as another editableList.
   */
  connectWith?: string;
  /**
   * Inserts the DOM/JQuery object as a header for the list.
   */
  header?: HTMLElement | JQuery;
  /**
   * Sets the height of the list including, if enabled, its add button. Setting height to ‘auto’ removes the vertical scrollbar and displays the list at the full height needed to contain the contents.
   */
  height?: number | string;
  /**
   * A callback function that gets called to filter what items are visible in the list.
   * 
   * @param data The data object for the row
   * 
   * @returns The function should return true/false (boolean) to indicate whether the item should be visible.
   */
  filter?: (data: TData) => boolean;
  /**
   * A function that gets called when the size of the list changes.
   */
  resize?: () => void;
  /**
   * A function that gets called against each item in the list when the size of the list changes.
   * 
   * @param row The jQuery DOM element for the row
   * @param index The index of the row
   * 
   * The original data for the item is stored under a property called data.
   * 
   * This callback is invoked after the main resize callback is called.
   */
  resizeItem?: (row: JQuery, index: number) => void;
  /**
   * If set to true, each row is displayed with a delete button on the right-hand side. Clicking the button will remove the row from the list and trigger the removeItem callback, if set.
   */
  removable?: boolean;
  /**
   * A function that is called when an item is removed from the list.
   * 
   * @param data The original data item for the item
   * 
   * The remove can be triggered by either clicking an item’s remove button, or calling the remoteItem method.
   */
  removeItem?: (data: TData) => void;
  sortable?: boolean;
}

interface HTMLNodeRedEditableListElement<TData> extends JQuery<HTMLOListElement> {
  editableList(options: NodeRedEditiableListElementOptions<TData>): void;
  editableList(type: 'addItem', itemData: TData): void;
  editableList(type: 'addItems', itemData: TData[]): void;
  editableList(type: 'removeItem', itemData: TData): void;
  editableList(type: 'height', width: number | string | ((index: number, value: number) => void)): void;
  editableList(type: 'width', width: number | string | ((index: number, value: number) => void)): void;
  editableList(type: 'items'): TData[];
  editableList(type: 'clear'): void;
  editableList(type: 'filter', filter?: ((data: any) => void) | null): number;
  editableList(type: 'show', item: TData): void;
  editableList(type: 'sort', sort?: (dataA: TData, dataB: TData) => void): void;
  editableList(type: 'length'): number;
}

type NodeRedUIPropertyType = 'msg' | 'flow' | 'global' | 'str' | 'num' | 'bool' | 'json' | 'bin' | 'date' | 'jsonata' | 'env';

interface TypedInputOptions {
  type?: NodeRedUIPropertyType;
  value?: string;
  types?: NodeRedUIPropertyType[];
}

interface JQuery {
  typedInput(options: TypedInputOptions): JQuery;
  typedInput(propertyName: 'type', type: NodeRedUIPropertyType): JQuery;
  typedInput(propertyName: 'type'): NodeRedUIPropertyType;
  typedInput(propertyName: 'value', value: string): JQuery;
  typedInput(propertyName: 'value'): string;
  typedInput(propertyName: 'width', value: number): JQuery;
  editableList<TData>(options: NodeRedEditiableListElementOptions<TData>): void;
  editableList<TData>(type: 'addItem', itemData: TData): void;
  editableList<TData>(type: 'addItems', itemData: TData[]): void;
  editableList<TData>(type: 'removeItem', itemData: TData): void;
  editableList<TData>(type: 'height', width: number | string | ((index: number, value: number) => void)): void;
  editableList<TData>(type: 'width', width: number | string | ((index: number, value: number) => void)): void;
  editableList<TData>(type: 'items'): JQuery;
  editableList<TData>(type: 'clear'): void;
  editableList<TData>(type: 'filter', filter?: ((data: any) => void) | null): number;
  editableList<TData>(type: 'show', item: TData): void;
  editableList<TData>(type: 'sort', sort?: (dataA: TData, dataB: TData) => void): void;
  editableList<TData>(type: 'length'): number;
}
