import { TypedEmitter } from 'tiny-typed-emitter';

interface Events<TItem> {
  changed: (item?: TItem) => void;
}

interface ConstructorOptions {
  elementId: string;
}

interface Item {
  name: string;
}

export class SelectHandler<TItem extends Item> extends TypedEmitter<Events<TItem>> {

  private fElement: HTMLSelectElement;

  constructor(opts: ConstructorOptions) {
    super();
    this.fElement = document.getElementById(opts.elementId) as HTMLSelectElement;
    this.fElement.addEventListener('change', () => this.onElementSelectedOptionChanged());
  }

  get items() {
    const retVal: TItem[] = [];
    for (let index = 0; index < this.fElement.options.length; index++) {
      const item = JSON.parse(this.fElement.options[index].value) as TItem;
      retVal.push(item);
    }
    return retVal;
  }
  set items(value: TItem[]) {
    this.clear();
    value.forEach(item => {
      const option = document.createElement('option');
      option.selected = false;
      option.value = JSON.stringify(item);
      option.text = item.name;
      this.fElement.options.add(option);
    });
    if (this.fElement.options.length <= 0) {
      this.fElement.disabled = true;
      return;
    }
    this.fElement.disabled = false;
    this.selectedItem = this.items[0];
  }

  get selectedItem() { return this.fElement.selectedOptions.length > 0 ? JSON.parse(this.fElement.selectedOptions[0].value) : null; }
  set selectedItem(value: TItem | null) {
    this.fElement.selectedIndex = -1;
    if (!value) return;
    const matchingOption = this.findItemOption(value.name);
    if (!matchingOption) throw new Error(`Cannot find item named ${value.name}`);
    matchingOption.selected = true;
    this.onChanged(this.selectedItem ? this.selectedItem : undefined);
  }

  protected onChanged(section?: TItem) {
    this.emit('changed', section);
  }

  private onElementSelectedOptionChanged() {
    this.fElement.selectedOptions.length > 0 ? this.selectedItem = JSON.parse(this.fElement.selectedOptions[0].value) : null;
  } 

  private findItemOption(name: string) {
    for (let index = 0; index < this.fElement.options.length; index++) {
      const option = this.fElement.options[index];
      const item = JSON.parse(option.value) as TItem;
      if (item.name.toLocaleUpperCase() === name.toLocaleUpperCase()) return option;
    }
    return undefined;
  }

  /**
   * Clears all items from the HTMLSelectElement
   */
  clear() {
    this.fElement.options.length = 0;
  }

  /**
   * Finds an item in items array
   * @param name Name of the item to find
   * @returns A TItem object or undefined
   */
  find(name: string) {
    return this.items.find(i => i.name.toLocaleUpperCase() === name.toLocaleUpperCase());
  }

}
