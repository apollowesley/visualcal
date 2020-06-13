import { IpcMainEvent } from 'electron';
import { IpcRequest } from "@/common/IpcRequest";

export interface IpcChannel<TReqParams> {
  getName(): string;
  handle(event: IpcMainEvent, request: IpcRequest<TReqParams>): void;
}
