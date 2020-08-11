import aedesConstructor, { Aedes, AedesOptions, Client } from 'aedes';
import { createServer, Server } from 'net';

let aedes: Aedes | null = null;
let server: Server | null = null;

const stop = () => {
  try {
    if (server) server.close();
  } catch (error) {
    //
  }
  server = null;
  try {
    if (aedes) aedes.close();
  } catch (error) {
    //
  }
  aedes = null;
}

const handleClientConnected = (client: Client, connected: boolean = true) => {
  const connectedDisconnectedString = connected ? 'connected' : 'disconnected';
  console.info(`MQTT Client, ${client.id}, ${connectedDisconnectedString}`);
}

export const init = (port: number, options?: AedesOptions) => {
  return new Promise<number | Error>((resolve, reject) => {
    try {
      aedes = aedesConstructor(options);
      aedes.on('client', handleClientConnected);
      aedes.on('clientDisconnect', (client) => handleClientConnected(client, false));
      server = createServer(aedes.handle);
      server.once('listening', () => {
        return resolve(port);
      });
      server.once('error', (err) => {
        stop();
        return reject(err);
      });

      server.listen(port);
    } catch (error) {
      stop();
      return reject(error);
    }
  });
};
