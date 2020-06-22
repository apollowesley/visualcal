interface CreateWindowOptions extends VisualCalWindowOptions {
  config?: import('electron').BrowserWindowConstructorOptions;
}

interface Section {
  name: string;
}

interface Procedure {
  name: string;
  sections: Section[];
}
