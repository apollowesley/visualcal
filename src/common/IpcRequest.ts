export interface IpcRequest<TParms> {
  responseChannel?: string;
  params?: TParms[];
}
