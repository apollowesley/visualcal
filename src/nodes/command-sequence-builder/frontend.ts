import { NodeRedEditorClient, NodeRedNodeUIProperties } from '..';
import { OnEditPrepareThis, Operation, TypeSelectFieldOptions, Type as OperationType, CommandType, DataType, ResetType } from './types';

declare const RED: NodeRedEditorClient;

const IndySoftCommandSequenceBuilderDefaultOperation = () => {
  const operation: Operation = {
    unitId: '',
    type: 'command',
    unitIdPropertyType: 'str',
    interfaceIdPropertyType: 'str',
    commandType: 'write', // write, read, query
    writeData: '',
    writeDataPropertyType: 'str',
    writeDataType: 'string', // string, integer, byteArray, float32, float64. May not be important, included for now
    readDataTypePropertyType: 'str',
    readDataType: 'string',
    readLength: 0,
    useReadLength: false,
    responseTagPropertyType: 'str',
    responseTag: '',
    resetType: 'device',
    delayPropertyType: 'num',
    delay: 1000
  };
  return operation;
};

const IndySoftCommandSequenceBuilderValidateOperation = (operation: Operation) => {
  var isValid = true;
  switch (operation.type) {
    case 'command':
      if (!operation.unitId) {
        isValid = false;
      };
      if (operation.commandType === 'read' || operation.commandType === 'query') {
        if (!operation.readDataType) {
          isValid = false;
        }
        if (operation.useReadLength && (!operation.readLength || operation.readLength <= 0)) {
          isValid = false;
        }
        if (!operation.responseTag) {
          isValid = false;
        }
      }
      if (operation.commandType === 'write' || operation.commandType === 'query') {
        if (!operation.writeData) {
          isValid = false;
        }
      }
      break;
    case 'delay':
      if (!operation.delay || operation.delay <= 0) {
        isValid = false;
      }
      break;
    case 'reset':
      if (!operation.resetType) {
        isValid = false;
      } else {
        switch (operation.resetType) {
          case 'device':
            if (!operation.unitId) {
              isValid = false;
            }
            break;
          case 'interface':
            if (!operation.interfaceId) {
              isValid = false;
            }
            break;
          default:
            isValid = false;
        }
      }
      break;
    case 'trigger':
      if (!operation.unitId) {
        isValid = false;
      }
      break;
    default:
      isValid = false;
  }
  return isValid;
};

const IndySoftCommandSequenceBuilderNodeConfig: NodeRedNodeUIProperties = {
  color: '#F3B567',
  category: 'Bulk Operations',
  defaults: {
    name: {
      value: '',
      required: false
    },
    respondInBulk: {
      value: true,
      required: true
    },
    operations: {
      value: []
      // Removed validation, for now.  node.js file works, as expected, but this validation reports an error during deploy, 
      // but I can't log it from here, for now.
      // validate: validateOperation
    }
  },
  inputs: 1,
  outputs: 1,
  icon: 'template.svg',
  label: function () {
    return this.name || 'Command Sequence Builder';
  },
  labelStyle: function () {
    return this.name ? 'node_label_italic' : '';
  },
  paletteLabel: 'Command Sequence Builder',
  oneditprepare: function (this: OnEditPrepareThis) {
    const apendSelectField = (row: JQuery, className: string, options: TypeSelectFieldOptions[]) => {
      const field = $('<select/>', {
        class: className,
        style: 'width:110px; margin-right:10px;'
      }).appendTo(row);
      options.forEach(option => field.append($('<option></option>').val(option.value).text(option.label)));
      return field;
    };

    const appendTypedInput = (row: JQuery<HTMLElement>, className: string, label: string, types: NodeRedUIPropertyType[], type: NodeRedUIPropertyType, value: string | number) => {
      $('<div/>', { style: "display:inline-block;text-align:right; width:120px; padding-right:10px; box-sizing:border-box;" })
        .text(label).appendTo(row);
      const field = $('<input/>', {
        class: className,
        type: 'text'
      });
      // Fields must be appended, before using typedInput.  Otherwise, it will be hidden.
      field.appendTo(row);
      field.typedInput({ types: types });
      field.typedInput('type', type);
      field.typedInput('value', value.toLocaleString());
      return field;
    };

    const container = $('#node-input-operation-container');

    const operationTypeLabel = this._('indySoft.commandSequenceBuilderdBuilder.operationType.label');
    const operationCommandTypeLabel = this._('indySoft.commandSequenceBuilder.operationCommandType.label');

    const operationUnitIdLabel = this._('indySoft.commandSequenceBuilder.label.unitId');
    const operationInterfaceIdLabel = this._('indySoft.commandSequenceBuilder.label.interfaceId');

    const operationTypeCommandLabel = this._('indySoft.commandSequenceBuilder.operationType.option.command');
    const operationTypeDelayLabel = this._('indySoft.commandSequenceBuilder.operationType.option.delay');
    const operationTypeResetLabel = this._('indySoft.commandSequenceBuilder.operationType.option.reset');
    const operationTypeTriggerLabel = this._('indySoft.commandSequenceBuilder.operationType.option.trigger');

    const operationCommandTypeWriteDataLabel = this._('indySoft.commandSequenceBuilder.operationCommandType.label.writeData');
    const operationCommandTypeResponseTagLabel = this._('indySoft.commandSequenceBuilder.operationCommandType.label.responseTag');

    const operationCommandTypeReadLabel = this._('indySoft.commandSequenceBuilder.operationCommandType.option.read');
    const operationCommandTypeWriteLabel = this._('indySoft.commandSequenceBuilder.operationCommandType.option.write');
    const operationCommandTypeQueryLabel = this._('indySoft.commandSequenceBuilder.operationCommandType.option.query');

    const operationReadDataTypeStringLabel = this._('indySoft.commandSequenceBuilder.operationReadDataType.option.string');
    const operationReadDataTypeIntegerLabel = this._('indySoft.commandSequenceBuilder.operationReadDataType.option.integer');
    const operationReadDataTypeSingleLabel = this._('indySoft.commandSequenceBuilder.operationReadDataType.option.single');
    const operationReadDataTypeDoubleLabel = this._('indySoft.commandSequenceBuilder.operationReadDataType.option.double');
    const operationReadDataTypeByteArrayLabel = this._('indySoft.commandSequenceBuilder.operationReadDataType.option.byteArray');

    const operationDelayLabel = this._('indySoft.commandSequenceBuilder.operationDelay.label');

    const operationResetTypeDeviceLabel = this._('indySoft.commandSequenceBuilder.operationResetType.label.device');
    const operationResetTypeInterfaceLabel = this._('indySoft.commandSequenceBuilder.operationResetType.label.interface');

    const resizeOperation = (row: JQuery<HTMLElement>) => {
      const newWidth = row.width();
      if (!newWidth) return;
      row.find('.red-ui-typedInput').typedInput('width', newWidth - 130);
    };

    container.css('min-height', '300px');
    container.css('min-width', '450px');
    container.editableList<Operation>({
      addItem: (row, _, operation) => {
        if (!operation.hasOwnProperty('type')) {
          operation = IndySoftCommandSequenceBuilderDefaultOperation();
        }

        row.css({
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        });

        // === row 1 ===
        const row1 = $('<div/>').appendTo(row);
        // type select field
        const typeSelectFieldOptions = [{
          label: operationTypeCommandLabel,
          value: 'command'
        },
        {
          label: operationTypeDelayLabel,
          value: 'delay'
        },
        {
          label: operationTypeResetLabel,
          value: 'reset'
        },
        {
          label: operationTypeTriggerLabel,
          value: 'trigger'
        }];
        const typeSelectField = apendSelectField(row1, 'node-input-operation-type', typeSelectFieldOptions);

        // commandType select field
        const commandTypeSelectFieldOptions = [{
          label: operationCommandTypeReadLabel,
          value: 'read'
        },
        {
          label: operationCommandTypeWriteLabel,
          value: 'write'
        },
        {
          label: operationCommandTypeQueryLabel,
          value: 'query'
        }];
        const commandTypeSelectField = apendSelectField(row1, 'node-input-operation-command-type', commandTypeSelectFieldOptions);

        // readDataType select field
        const readDataTypeSelectFieldOptions = [{
          label: 'String',
          value: 'string'
        },
        {
          label: 'Boolean',
          value: 'boolean'
        },
        {
          label: 'Byte',
          value: 'byte'
        },
        {
          label: 'Character',
          value: 'char'
        },
        {
          label: 'Int16',
          value: 'int16'
        },
        {
          label: 'Int32',
          value: 'int32'
        },
        {
          label: 'Int64',
          value: 'int64'
        },
        {
          label: 'Float32',
          value: 'float32'
        },
        {
          label: 'Float64',
          value: 'float64'
        },
        {
          label: 'Byte array',
          value: 'byteArray'
        }];
        const readDataTypeSelectField = apendSelectField(row1, 'node-input-operation-read-data-type', readDataTypeSelectFieldOptions);

        // readDataType select field
        const resetTypeSelectFieldOptions = [{
          label: operationResetTypeDeviceLabel,
          value: 'device'
        },
        {
          label: operationResetTypeInterfaceLabel,
          value: 'interface'
        }];
        const resetTypeSelectField = apendSelectField(row1, 'node-input-operation-reset-type', resetTypeSelectFieldOptions);

        // === row 2 ===
        const row2 = $('<div/>', { style: "margin-top:8px;" }).appendTo(row);
        // unitId field
        const unitIdField = appendTypedInput(row2, 'node-input-operation-unitId', operationUnitIdLabel, ['msg', 'flow', 'global', 'str', 'num', 'bool', 'json', 'bin', 'date', 'jsonata', 'env'], operation.unitIdPropertyType, operation.unitId);

        // === row 3 ===
        const row3 = $('<div/>', { style: "margin-top:8px;" }).appendTo(row);
        // writeData field
        if (operation.writeData) appendTypedInput(row3, 'node-input-operation-write-data', operationCommandTypeWriteDataLabel, ['msg', 'flow', 'global', 'str', 'num', 'bool', 'json', 'bin', 'date', 'jsonata', 'env'], operation.writeDataPropertyType, operation.writeData);

        // === row 4 ===
        const row4 = $('<div/>', { style: "margin-top:8px;" }).appendTo(row);
        // responseTag field
        if (operation.responseTag) appendTypedInput(row4, 'node-input-operation-response-tag', operationCommandTypeResponseTagLabel, ['msg', 'flow', 'global', 'str', 'num', 'bool', 'json', 'bin', 'date', 'jsonata', 'env'], operation.responseTagPropertyType, operation.responseTag);

        // === row 5 ===
        const row5 = $('<div/>', { style: "margin-top:8px;" }).appendTo(row);
        // delay field
        appendTypedInput(row5, 'node-input-operation-delay', operationDelayLabel, ['msg', 'flow', 'global', 'num', 'json', 'jsonata', 'env'], operation.delayPropertyType, operation.delay);

        // === row 6 ===
        const row6 = $('<div/>', { style: "margin-top:8px;" }).appendTo(row);
        // delay field
        if (operation.interfaceId) appendTypedInput(row6, 'node-input-operation-interfaceId', operationInterfaceIdLabel, ['msg', 'flow', 'global', 'str', 'num', 'bool', 'json', 'bin', 'date', 'jsonata', 'env'], operation.interfaceIdPropertyType, operation.interfaceId);

        function updateVisibleFieldsAndRows() {
          var type = typeSelectField.val();
          var commandType = commandTypeSelectField.val();
          switch (type) {
            case 'command':
              row2.show();
              row5.hide();
              row6.hide();
              commandTypeSelectField.show();
              resetTypeSelectField.hide();
              switch (commandType) {
                case 'read':
                  row3.hide();
                  row4.show();
                  readDataTypeSelectField.show();
                  break;
                case 'write':
                  row3.show();
                  row4.hide();
                  readDataTypeSelectField.hide();
                  break;
                case 'query':
                  row3.show();
                  row4.show();
                  readDataTypeSelectField.show();
                  break;
              }
              break;
            case 'delay':
              row2.hide();
              row3.hide();
              row4.hide();
              row5.show();
              row6.hide();
              commandTypeSelectField.hide();
              readDataTypeSelectField.hide();
              resetTypeSelectField.hide();
              break;
            case 'reset':
              row3.hide();
              row4.hide();
              row5.hide();
              commandTypeSelectField.hide();
              readDataTypeSelectField.hide();
              resetTypeSelectField.show();
              switch (operation.resetType) {
                case 'device':
                  row2.show();
                  row6.hide();
                  break;
                case 'interface':
                  row2.hide();
                  row6.show();
                  break;
              }
              break;
            case 'trigger':
              row2.show();
              row3.hide();
              row4.hide();
              row5.hide();
              row6.hide();
              commandTypeSelectField.hide();
              readDataTypeSelectField.hide();
              resetTypeSelectField.hide();
              break;
              break;
            default:
              row2.hide();
              row3.hide();
              row4.hide();
              row5.hide();
              row6.hide();
              commandTypeSelectField.hide();
              readDataTypeSelectField.hide();
              resetTypeSelectField.hide();
          }
          resizeOperation(row);
        }

        typeSelectField.on('change', function () {
          updateVisibleFieldsAndRows();
        });

        commandTypeSelectField.on('change', function () {
          updateVisibleFieldsAndRows();
        });

        resetTypeSelectField.on('change', function () {
          updateVisibleFieldsAndRows();
        });

        typeSelectField.val(operation.type);
        commandTypeSelectField.val(operation.commandType);
        if (operation.readDataType) readDataTypeSelectField.val(operation.readDataType);
        if (operation.resetType) resetTypeSelectField.val(operation.resetType);

        typeSelectField.change();
        commandTypeSelectField.change();
        readDataTypeSelectField.change();
        resetTypeSelectField.change();
      },
      resizeItem: resizeOperation,
      removable: true,
      sortable: true
    });

    if (!this.operations) this.operations = [];
    container.editableList('addItems', this.operations);
  },
  oneditsave: function (this: OnEditPrepareThis) {
    var operations = $('#node-input-operation-container').editableList<Operation>('items');
    var node = this;
    node.operations = [];
    operations.each((_, operation) => {
      const jqOperation = $(operation);
      var type = jqOperation.find('.node-input-operation-type').val() as OperationType;
      var commandType = jqOperation.find('.node-input-operation-command-type').val() as CommandType;
      var readDataType = jqOperation.find('.node-input-operation-read-data-type').val() as DataType;
      var resetType = jqOperation.find('.node-input-operation-reset-type').val() as ResetType;
      var unitIdField = jqOperation.find('.node-input-operation-unitId');
      var interfaceIdField = jqOperation.find('.node-input-operation-interfaceId');
      var writeDataField = jqOperation.find('.node-input-operation-write-data');
      var responseTagField = jqOperation.find('.node-input-operation-response-tag');
      var delayField = jqOperation.find('.node-input-operation-delay');
      var readDataTypeField = jqOperation.find('.node-input-operation-delay');
      var r: Operation = {
        type: type,
        unitId: unitIdField.typedInput('value'),
        interfaceId: interfaceIdField.typedInput('value'),
        commandType: commandType,
        writeData: writeDataField.typedInput('value'),
        readDataType: readDataType,
        readDataTypePropertyType: readDataTypeField.typedInput('type'),
        responseTag: responseTagField.typedInput('value'),
        delay: parseInt(delayField.typedInput('value')),
        resetType: resetType,
        unitIdPropertyType: unitIdField.typedInput('type'),
        interfaceIdPropertyType: interfaceIdField.typedInput('type'),
        writeDataPropertyType: writeDataField.typedInput('type'),
        responseTagPropertyType: responseTagField.typedInput('type'),
        delayPropertyType: delayField.typedInput('type')

      };
      if (node.operations) node.operations.push(r);
    });
  },
  oneditresize: function (size) {
    var rows = $('#dialog-form>div:not(.node-input-operation-container-row)');
    var height = size.height;
    rows.each((_, row) => {
      const outerHeight = $(row).outerHeight(true);
      if (outerHeight) height -= outerHeight;
    });
    var editorRow = $('#dialog-form>div.node-input-operation-container-row');
    height -= (parseInt(editorRow.css('marginTop')) + parseInt(editorRow.css('marginBottom')));
    $('#node-input-operation-container').editableList('height', height);
  }
};

RED.nodes.registerType('{{ nodeType }}', IndySoftCommandSequenceBuilderNodeConfig);
