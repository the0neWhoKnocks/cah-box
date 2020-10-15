const { OPEN, Server } = require('ws');
const log = require('../../utils/logger')('socket');
const getUser = require('../utils/getUser');

const rooms = new Map();
const disconnectChecksForRoom = new Map();

const disconnectKey = (roomID, username) => `${roomID}__${username}`;

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
    log(`Room "${roomID}" deleted`);
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

  enterRoom(roomID, username, cb) {
    const room = rooms.get(roomID);

    if (room) room.sockets.push(this.socket);
    // User didn't create the room, they're just joining so keep a reference
    if (!this.data.roomID) this.data.roomID = roomID;

    // Rejoining a running game
    if (room && username) {
      const user =  getUser(room, username);
      
      if (user) {
        this.data.user = user;
        user.connected = true;
        
        const dKey = disconnectKey(roomID, username);
        const disconnectCheck = disconnectChecksForRoom.get(dKey);
        if (disconnectCheck) {
          clearTimeout(disconnectCheck);
          disconnectChecksForRoom.delete(dKey);
        }
  
        log(`User "${user.name}" reconnected`);
      }
    }
    
    cb(room);
  }

  getRoom(roomID) {
    return rooms.get(roomID);
  }

  leaveRoom(roomID, username, timeout) {
    disconnectChecksForRoom.set(disconnectKey(roomID, username), timeout);
  }
}

module.exports = function socket(server) {
  const wss = new Server({ server });
  const socketHandlers = require('./socketHandlers');

  wss.on('connection', function connected(currentUserSocket) {
    log('Server Socket connected to Client');
    socketHandlers(currentUserSocket, new ServerSocket(currentUserSocket, wss));
  });

  return new ServerSocket(undefined, wss);
}
