const {
  WS__MSG__CONNECTED_TO_SERVER,
  WS__MSG__PING,
  WS__CLOSE_CODE__DISCONNECTED,
} = require('../../constants');
const log = require('../../utils/logger')('socket.handleClientConnect');
const getUser = require('../utils/getUser');
const handleClientDisconnect = require('./handleClientDisconnect');

const rooms = new Map();
const disconnectChecksForRoom = new Map();
const disconnectKey = (roomID, username) => `${roomID}__${username}`;

module.exports = function handleClientConnect(wss) {
  Object.assign(wss, {
    data: {},
    socket: wss.clientSocket,
    
    createRoom(roomID, data = {}) {
      let room = rooms.get(roomID);
      
      if (!room) {
        room = { data, sockets: [] };
        rooms.set(roomID, room);
      }
  
      return room;
    },
  
    deleteRoom(roomID) {
      rooms.delete(roomID);
      log.info(`Room "${roomID}" deleted`);
    },
    
    dispatchToAllInRoom(roomID, type, data = {}) {
      const filterFn = (socket) => {
        const room = wss.getRoom(roomID);
        return room && room.sockets.includes(socket);
      };
      
      wss.dispatchToClients(type, data, filterFn);
    },
    
    dispatchToOthersInRoom(roomID, type, data = {}) {
      const filterFn = (socket) => {
        const room = wss.getRoom(roomID);
        return room && room.sockets.includes(socket) && socket !== wss.socket;
      };
      
      wss.dispatchToClients(type, data, filterFn);
    },
  
    enterRoom(roomID, username, cb) {
      const room = rooms.get(roomID);
      
      if (room) room.sockets.push(this.socket);
      // User didn't create the room, they're just joining so keep a reference
      if (!this.data.roomID) this.data.roomID = roomID;
  
      // Rejoining a running game
      if (room && username) {
        const user = getUser(room, username);
        
        if (user) {
          this.data.user = user;
          user.connected = true;
          
          const dKey = disconnectKey(roomID, username);
          const disconnectCheck = disconnectChecksForRoom.get(dKey);
          if (disconnectCheck) {
            clearTimeout(disconnectCheck);
            disconnectChecksForRoom.delete(dKey);
          }
    
          log.info(`User "${user.name}" reconnected`);
        }
      }
      
      clearInterval(wss.heartbeat);
      wss.heartbeat = setInterval(() => {
        // The check should respond almost immediately, so if this prop exists, the
        // User may have suffered an internet connection failure (not the same as
        // them manually disconnecting).
        if (wss.connectionCheckPending) {
          const { roomID } = wss.data;
          const room = wss.getRoom(roomID);
          
          if (room) handleClientDisconnect(wss, WS__CLOSE_CODE__DISCONNECTED, 'User removed due to possible internet connection failure');
        }
        
        wss.dispatchToClient(WS__MSG__PING);
        wss.connectionCheckPending = true;
      }, 2000);
      
      cb(room);
    },
  
    getRoom(roomID) {
      return rooms.get(roomID);
    },
  
    leaveRoom(roomID, username, timeout) {
      clearInterval(wss.heartbeat);
      disconnectChecksForRoom.set(disconnectKey(roomID, username), timeout);
    },
  });
  log.info('Socket API extended');
  
  wss.dispatchToClient(WS__MSG__CONNECTED_TO_SERVER, { id: wss.id, msg: 'App connected to Server' });
}
