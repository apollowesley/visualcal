import http from 'http';
import ws from 'ws';
import { STORE_UPDATED } from 'visualcal-common/dist/driver-builder';

export let webSocketServer: ws.Server;

export const init = (server: http.Server) => {
  webSocketServer = new ws.Server({ noServer: true });
  webSocketServer.on('connection', (socket) => {
    socket.on('message', (data) => {
      if (typeof data === 'string' && data === 'PING') socket.send('PONG');
    });
  });

  server.on('upgrade', (request, socket, head) => {
    webSocketServer.handleUpgrade(request, socket, head, socket => {
      webSocketServer.emit('connection', socket, request);
    });
  });
}

export const notifyStoreUpdated = () => {
  setImmediate(() => webSocketServer.clients.forEach(client => client.send(STORE_UPDATED)));
}
