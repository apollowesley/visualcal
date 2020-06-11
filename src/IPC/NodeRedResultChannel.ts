import { IpcMainEvent } from 'electron';
import { IpcRequest } from "@shared/IpcRequest";
import { IpcChannel } from "./IpcChannel";

export class NodeRedResultChannel implements IpcChannel<string> {
  getName(): string {
    return 'node-red';
  }

  handle(event: IpcMainEvent, request: IpcRequest<string>): void {
    global.visualCal.logger.info(request);
  }
}
