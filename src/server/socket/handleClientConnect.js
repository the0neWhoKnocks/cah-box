// const { OPEN } = require('ws');
const { WS__MSG__CONNECTED_TO_SERVER } = require('../../constants');
const log = require('../../utils/logger')('socket.handleClientConnect');
const getUser = require('../utils/getUser');

const rooms = new Map();
const disconnectChecksForRoom = new Map();
const disconnectKey = (roomID, username) => `${roomID}__${username}`;

module.exports = function handleClientConnect(wss) {
  Object.assign(wss, {
    data: {},
    // TODO: figure out if these props are neccessary (from server/socket/index.js)
    // serverInstance: wsServerInst,
    socket: wss.clientSocket, // TODO maybe just use `wss.id`
    
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
      log(`Room "${roomID}" deleted`);
    },
    
    // TODO maybe instead of checking sockets, store the unique client `id` and compare against it.
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
    
          log(`User "${user.name}" reconnected`);
        }
      }
      
      cb(room);
    },
  
    getRoom(roomID) {
      return rooms.get(roomID);
    },
  
    leaveRoom(roomID, username, timeout) {
      disconnectChecksForRoom.set(disconnectKey(roomID, username), timeout);
    },
  });
  log.info('Socket API extended');
  
  
  wss.dispatchToClient(WS__MSG__CONNECTED_TO_SERVER, { id: wss.id, msg: 'App connected to Server' });
}
