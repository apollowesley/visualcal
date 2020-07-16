interface CommunicationConfig {
  interfaces: CommunicationInterfaceInfo[];
}

export interface Config {
  name: string;
  username: string;
  comms: CommunicationConfig;
}
