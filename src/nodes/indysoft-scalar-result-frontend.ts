import Qty from 'js-quantities';

interface ConstructorOptions {
  description?: string;
  baseQuantity?: string;
  derivedQuantity?: string;
  derivedQuantityPrefix?: string;
  toleranceType?: string;
  color: string;
  category: string;
  defaults: {};
  inputs: number;
  outputs: number;
  icon: string;
  label: string | Function;
  name?: string;
  labelStyle: string | Function;
  paletteLabel: string;
  oneditprepare?: (this: ConstructorOptions) => void;
  oneditsave?: (this: ConstructorOptions) => void;
}

interface NodeRedNodes {
  registerType(type: string, constructorOptions: ConstructorOptions): void;
}

interface NodeRed {
  nodes: NodeRedNodes;
}

declare const RED: NodeRed;

RED.nodes.registerType('indysoft-scalar-result', {
  color: '#d3d936',
  category: 'Results',
  defaults: {
    name: { value: '' },
    description: { value: '' },
    baseQuantity: { value: 'acceleration', required: true },
    derivedQuantity: { value: 'gee', required: false },
    derivedQuantityPrefix: { value: 'none', required: false },
    toleranceType: { value: 'limit', required: true },
    min: { value: 0, required: true },
    max: { value: 100, required: true },
    inputLevel: { value: '', required: true }
  },
  inputs: 1,
  outputs: 1,
  icon: 'measure.svg',
  label: function() {
    return this.name || `Scalar Result: ${this.description}`;
  },
  labelStyle: function() {
    return this.name ? 'node_label_italic' : '';
  },
  paletteLabel: 'Scalar Result',
  oneditprepare: function() {
    const baseQuantitySelectInput = $('#node-input-baseQuantity');
    const derivedQuantitySelectInput = $('#node-input-derivedQuantity');
    const derivedQuantityRow = $('#derivedQuantity-row');
    const quantityKinds = Qty.getKinds().sort();

    baseQuantitySelectInput.empty();
    quantityKinds.forEach(kind => baseQuantitySelectInput.append(`<option value="${kind}">${kind}</option>`));
    baseQuantitySelectInput.val($('#node-input-baseQuantity option:first').val() as string);

    baseQuantitySelectInput.on('change', () => {
      const baseQuantity = baseQuantitySelectInput.val() as string;
      const derivedQuantities = Qty.getUnits(baseQuantity).sort();
      derivedQuantitySelectInput.empty();
      if (baseQuantity !== 'unitless') {
        derivedQuantities.forEach(derived => derivedQuantitySelectInput.append(`<option value="${derived}">${derived}</option>`));
        derivedQuantitySelectInput.val($('#node-input-derivedQuantity option:first').val() as string);
        derivedQuantityRow.show();
      } else {
        derivedQuantityRow.hide();
      }
    });

    baseQuantitySelectInput.change();
    if (this.baseQuantity) baseQuantitySelectInput.val(this.baseQuantity).val();
    if (this.derivedQuantity) derivedQuantitySelectInput.val(this.derivedQuantity).val();
  },
  oneditsave: function() {
    const toleranceTypeValue = $('#node-input-toleranceType').val() as string;
    const baseQuantityValue = $('#node-input-baseQuantity').val() as string;
    const derivedQuantityPrefixValue = $('#node-input-derivedQuantityPrefix').val() as string;
    const derivedQuantityPrefixText = $('#node-input-derivedQuantityPrefix option:selected').text();
    const derivedQuantityValue = $('#node-input-derivedQuantity').val() as string;
    const inputLevelValue = $('#node-input-inputLevel').val();

    this.description = `${inputLevelValue}`;
    if (baseQuantityValue !== 'unitless') this.description = `${this.description} ${derivedQuantityPrefixText === 'N/A' ? '' : derivedQuantityPrefixText} ${derivedQuantityValue}`;

    this.baseQuantity = baseQuantityValue;
    this.derivedQuantity = derivedQuantityValue;
    this.derivedQuantityPrefix = derivedQuantityPrefixValue;
    this.toleranceType = toleranceTypeValue;
  }
});
