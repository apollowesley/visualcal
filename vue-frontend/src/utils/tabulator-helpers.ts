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

// eslint-disable-next-line
export const checkboxEditor = (cell: Tabulator.CellComponent, onRendered: Tabulator.EmptyCallback, success: Tabulator.ValueBooleanCallback, cancel: Tabulator.ValueVoidCallback) => {
  const editor = document.createElement('input');

  editor.setAttribute('type', 'checkbox');

  //create and style input
  editor.style.padding = '3px';
  editor.style.width = '100%';
  editor.style.boxSizing = 'border-box';

  editor.checked = !!cell.getValue();

  onRendered(() => {
    editor.focus();
    // editor.style.css = '100%'; ?
  });

  const onSuccess = () => {
    success(editor.checked);
  }

  editor.addEventListener('change', onSuccess);
  editor.addEventListener('blur', onSuccess);

  return  editor;
}

// eslint-disable-next-line
export const stringEditor = (cell: Tabulator.CellComponent, onRendered: Tabulator.EmptyCallback, success: Tabulator.ValueBooleanCallback, cancel: Tabulator.ValueVoidCallback) => {
  const editor = document.createElement('input');

  // editor.setAttribute('type', 'checkbox');

  //create and style input
  editor.style.padding = '3px';
  editor.style.width = '100%';
  editor.style.boxSizing = 'border-box';

  editor.value = cell.getValue();

  onRendered(() => {
    editor.focus();
    // editor.style.css = '100%'; ?
  });

  const onSuccess = () => {
    success(editor.value);
  }

  editor.addEventListener('change', onSuccess);
  editor.addEventListener('blur', onSuccess);

  return  editor;
}

// eslint-disable-next-line
export const numberEditor = (cell: Tabulator.CellComponent, onRendered: Tabulator.EmptyCallback, success: Tabulator.ValueBooleanCallback, cancel: Tabulator.ValueVoidCallback) => {
  const editor = document.createElement('input');

  editor.setAttribute('type', 'number');

  //create and style input
  editor.style.padding = '3px';
  editor.style.width = '100%';
  editor.style.boxSizing = 'border-box';

  editor.value = cell.getValue();

  onRendered(() => {
    editor.focus();
    // editor.style.css = '100%'; ?
  });

  const onSuccess = () => {
    success(editor.valueAsNumber);
  }

  // editor.addEventListener('change', onSuccess);
  editor.addEventListener('blur', onSuccess);

  return  editor;
}
