import Tabulator from 'tabulator-tables';

interface RemoveRowButtonCellFormatterOptions {
  beforeRemove?: (cell: Tabulator.CellComponent) => boolean;
  afterRemove?: (cell: Tabulator.CellComponent) => void;
}

export const formatRemoveRowButtonCell = (table: Tabulator, cell: Tabulator.CellComponent, opts?: RemoveRowButtonCellFormatterOptions) => {
  const button = document.createElement('button') as HTMLButtonElement;
  const onButtonClicked = () => {
    let remove = true;
    if (opts && opts.beforeRemove) remove = opts.beforeRemove(cell);
    if (remove) {
      button.removeEventListener('click', onButtonClicked);
      table.deleteRow(cell.getRow());
      if (opts && opts.afterRemove) opts.afterRemove(cell);
    }
  };
  button.textContent = 'Remove';
  button.style.height = '100%';
  button.style.width = '100%';
  button.style.margin = '2px';
  button.style.backgroundColor = 'grey';
  button.addEventListener('click', onButtonClicked);
  return button;
}
