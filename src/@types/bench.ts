import { config } from 'winston';

export interface CommunicationConfig {
  interfaces: CommunicationInterfaceInfo[];
}

export interface Config {
  name: string;
  username: string;
  comms: CommunicationConfig;
}
