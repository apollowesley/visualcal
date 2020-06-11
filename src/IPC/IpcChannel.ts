import { IpcMainEvent } from 'electron';
import { IpcRequest } from "@shared/IpcRequest";

export interface IpcChannel<TReqParams> {
  getName(): string;
  handle(event: IpcMainEvent, request: IpcRequest<TReqParams>): void;
}
