declare module 'udp-discovery'{

  import { TypedEmitter } from 'tiny-typed-emitter';

  export interface DiscoveryConstructorOptions {
    port?: number;
    bindAddr?: string;
    dgramType?: string;
  }

  interface DiscoveryEvents {
    available: (name: string, data: any, reason: string) => void;
    unavailable: (name: string, data: any, reason: string) => void;
    MessageBus?: (eventName: string, data: any) => void;
  }

  interface ServiceFunction {
    (name: string, userData: any, interval?: number, available?: boolean): void;
  }

  export class Discovery extends TypedEmitter<DiscoveryEvents> {
    constructor(options?: DiscoveryConstructorOptions);
    announce: ServiceFunction;
    pause(name: string): boolean;
    resume(name: string, interval?: number): boolean;
    getData(name: string): any;
    update: ServiceFunction;
    sendEvent(eventName: string, data: any): void;
  }
}
