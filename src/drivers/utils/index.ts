import SerialPort from 'serialport';

export const getSerialPorts = async () => {
  const ports = await SerialPort.list();
  return ports;
};

export const sleep = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      return resolve();
    }, ms);
  });
}
