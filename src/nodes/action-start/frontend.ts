import type { NodeProperties } from 'node-red';

export interface NodeRedNodeUIProperties {
  sectionConfigId?: string;
  name?: string;
  category: string;
  defaults: any;
  credentials?: any;
  inputs?: number;
  outputs?: number;
  color: string;
  paletteLabel?: string | any;
  label?: string | any;
  labelStyle?: string | any;
  inputLabels?: string[] | any;
  outputLabels?: string[] | any;
  icon?: string;
  align?: 'left' | 'right';
  button?: any;
  oneditprepare?: () => void;
  oneditsave?: () => void;
  oneditcancel?: () => void;
  oneditdelete?: () => void;
  oneditresize?: () => void;
  onpaletteadd?: () => void;
  onpaletteremove?: () => void;
}

interface NodeRedNodesEachConfigCallback {
  (node: NodeProperties): void;
}

interface NodeRedNodes {
  eachConfig(callback: NodeRedNodesEachConfigCallback): void;
  registerType<T extends NodeProperties>(type: string, constructor: (props: T) => any, opts?: any): void;
}

interface NodeRedEditorClient {
  nodes: NodeRedNodes;
}

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

RED.nodes.registerType('indysoft-action-start', IndySoftActionStartNodeConfig as any);
