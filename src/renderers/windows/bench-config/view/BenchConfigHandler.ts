import { TypedEmitter } from 'tiny-typed-emitter';
import Tabulator from 'tabulator-tables';
import { SelectHandler } from '../../../components/SelectHandler';

interface ConstructorOptions {
  existingConfigsSelectId: string;
  selectedConfigCommInterfacesTableId: string;
}

interface Events {
  
}

export class BenchConfigHandler extends TypedEmitter<Events> {

  private fExistingConfigsHandler: SelectHandler<BenchConfig>;
  private fSelectedConfigCommInterfacesTable: Tabulator;

  constructor(opts: ConstructorOptions) {
    super();
    this.fExistingConfigsHandler = new SelectHandler({
      elementId: opts.existingConfigsSelectId
    });

    this.fSelectedConfigCommInterfacesTable = new Tabulator(`#${opts.selectedConfigCommInterfacesTableId}`, {

    });
  }

}
