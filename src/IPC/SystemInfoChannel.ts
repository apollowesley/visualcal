
import { execSync } from "child_process";
import { IpcMainEvent } from 'electron';
import { IpcRequest } from "@shared/IpcRequest";
import { IpcChannel } from "./IpcChannel";

export class SystemInfoChannel implements IpcChannel {
  getName(): string {
    return 'system-info';
  }

  handle(event: IpcMainEvent, request: IpcRequest): void {
    if (!request.responseChannel) {
      request.responseChannel = `${this.getName()}_response`;
    }
    event.sender.send(request.responseChannel, { kernel: execSync('uname -a').toString() });
  }
}
