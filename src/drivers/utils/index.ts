import SerialPort from 'serialport';

export const getSerialPorts = async () => {
  const ports = await SerialPort.list();
  return ports;
};
