import { NodeRedEditorClient, NodeRedNodeUIProperties } from '..';

declare const RED: NodeRedEditorClient;

const IndySoftActionStartNodeConfig: NodeRedNodeUIProperties = {
  color: '#34a1eb',
  category: 'Actions',
  defaults: {
    name: { value: 'MyAction', required: true },
    sectionConfigId: { type: 'indysoft-section-configuration', required: true }
  },
  inputs: 0,
  outputs: 1,
  icon: 'inject.svg',
  label: function() {
    let sectionConfig: NodeRedNodeUIProperties = this;
    RED.nodes.eachConfig(node => {
      if (node.id === this.sectionConfigId) sectionConfig = node as any;
    });
    if (sectionConfig) return `Section: ${sectionConfig.name}; Action: ${this.name}`;
    return `Section: <none>; Action: ${this.name}`;
  },
  labelStyle: function () {
    return 'node_label_italic';
  },
  paletteLabel: 'Start Action'
}

RED.nodes.registerType('indysoft-action-start', IndySoftActionStartNodeConfig);
