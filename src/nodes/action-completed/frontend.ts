import { NodeRedEditorClient, NodeRedNodeUIProperties } from '..';

declare const RED: NodeRedEditorClient;

const IndySoftActionCompletedNodeConfig: NodeRedNodeUIProperties = {
  color: '#34a1eb',
  category: 'Actions',
  defaults: {
    name: { value: '' }
  },
  inputs: 1,
  outputs: 0,
  icon: 'inject.svg',
  label: function() {
    return 'Completed';
  },
  labelStyle: function () {
    return this.name ? 'node_label_italic' : '';
  },
  paletteLabel: 'Completed Action'
}

RED.nodes.registerType('indysoft-action-completed', IndySoftActionCompletedNodeConfig);
