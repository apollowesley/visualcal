import { PrologixGpibTcpInterface } from './communication-interfaces/prologix/PrologixGpibTcpInterface'

export const getInterface = (name: string) => {
  return new PrologixGpibTcpInterface();
}
