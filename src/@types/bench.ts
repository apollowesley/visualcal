interface CommunicationConfig {
  interfaces: CommunicationInterfaceConfigurationInfo[];
}

export interface Config {
  name: string;
  username: string;
  comms: CommunicationConfig;
}
