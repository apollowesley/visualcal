import http from 'http';
import socketIo from 'socket.io';

export let webSocketServer: socketIo.Server;

const onConnection = (socket: socketIo.Socket) => {
  console.info(`New socket.io connection: ${socket}`);
}

export const init = (server: http.Server) => {
  webSocketServer = socketIo(server, {
    transports: [ 'websocket' ]
  });
  webSocketServer.on('connection', onConnection);
}
