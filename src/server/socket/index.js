const { OPEN, Server } = require('ws');
const rooms = new Map();

// NOTE - wrapping API in case I need to refactor again in the future
class ServerSocket {
  constructor(currentUserSocket, wsServerInst) {
    this.data = {};
    this.serverInstance = wsServerInst;
    this.socket = currentUserSocket;
  }

  createRoom(roomID, data = {}) {
    let room = rooms.get(roomID);
    
    if (!room) {
      room = { data, sockets: [] };
      rooms.set(roomID, room);
    }

    return room;
  }

  deleteRoom(roomID) {
    rooms.delete(roomID);
    console.log(`Room "${roomID}" deleted`);
  }

  emitToAll(type, data = {}) {
    this.serverInstance.clients.forEach((socket) => {
      if (socket.readyState === OPEN) {
        socket.send(JSON.stringify({ data, type }));
      }
    });
  }

  emitToAllInRoom(roomID, type, data = {}) {
    this.serverInstance.clients.forEach((socket) => {
      const room = this.getRoom(roomID);

      if (
        room
        && room.sockets.includes(socket)
        && socket.readyState === OPEN
      ) {
        socket.send(JSON.stringify({ data, type }));
      }
    });
  }

  emitToOthersInRoom(roomID, type, data = {}) {
    this.serverInstance.clients.forEach((socket) => {
      const room = this.getRoom(roomID);

      if (
        room
        && room.sockets.includes(socket)
        && socket !== this.socket
        && socket.readyState === OPEN
      ) {
        socket.send(JSON.stringify({ data, type }));
      }
    });
  }

  emitToSelf(type, data = {}) {
    if (this.socket.readyState === OPEN) {
      this.socket.send(JSON.stringify({ data, type }));
    }
  }

  getRoom(roomID) {
    return rooms.get(roomID);
  }

  joinRoom(roomID, cb) {
    const room = rooms.get(roomID);
    if (room) room.sockets.push(this.socket);
    cb(room);
  }
}

module.exports = function socket(server) {
  const wss = new Server({ server });
  const connectionHandlers = require('./connectionHandlers');

  wss.on('connection', function connected(currentUserSocket) {
    console.log('Server Socket connected to Client');
    connectionHandlers(currentUserSocket, new ServerSocket(currentUserSocket, wss));
  });

  return new ServerSocket(undefined, wss);
}
