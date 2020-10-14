const log = require('../../utils/logger')('gameActions:enterRoom');

const disconnectChecksForRoom = new Map();

const disconnectKey = (roomID, username) => `${roomID}__${username}`;

module.exports = (serverSocket) => function enterRoom({ roomID, username }) {
  const {
    DISCONNECT_TIMEOUT,
    WS__MSG_TYPE__ROOM_DESTROYED,
    WS__MSG_TYPE__USER_DISCONNECTED,
    WS__MSG_TYPE__USER_ENTERED_ROOM,
    WS__MSG_TYPE__USER_LEFT_ROOM,
  } = require('../../constants');
  const assignNextAdmin = require('../utils/assignNextAdmin');
  const assignNextCzar = require('../utils/assignNextCzar');
  const getUser = require('../utils/getUser');
  const resetGameRound = require('../utils/resetGameRound');
  const dealCards = require('./dealCards');

  serverSocket.joinRoom(roomID, (room) => {
    if (room) {
      serverSocket.socket.on('close', () => {
        const { user } = serverSocket.data;
        
        if (user) {
          log(`User "${user.name}" disconnected`);
          user.connected = false;

          serverSocket.emitToOthersInRoom(roomID, WS__MSG_TYPE__USER_DISCONNECTED, {
            room: room.data.public,
          });
  
          // if a User refreshed their Browser, `connected` will be set back to
          // `true` fairly quickly. The timeout value is a guesstimate based on a
          // User having assets cached so the reload time should be quick.
          const disconnectCheck = setTimeout(() => {
            delete user.disconnectCheck;

            if (!user.connected) {
              const { private: { cards: { live } } } = room.data;
              const { admin, cards, czar } = user;
              
              // user is Admin, assign next admin
              if (admin) assignNextAdmin(room);
              
              // user is Czar, assign next czar
              if (czar) {
                assignNextCzar(room, true);
                dealCards(serverSocket)({ newRound: true, roomID });
              }
              
              // remove the User
              room.data.public.users = room.data.public.users.filter(({ name }) => name !== user.name);
  
              // if all Users have left, kill the room
              if (!room.data.public.users.length) {
                log(`All Users have left, killing room "${roomID}"`);
  
                // it's possible that a User is in the process of joining when
                // the Admin left the room, so lets tell them that the room no
                // longer exists.
                serverSocket.emitToSelf(WS__MSG_TYPE__ROOM_DESTROYED);
  
                serverSocket.deleteRoom(roomID);
              }
              else {
                // dump white cards back into `live` cards
                cards.forEach(({ text }) => { live.white.push(text); });
  
                // if there aren't enough players, put game back into a waiting state
                if (room.data.public.users.length === 1) {
                  room.data.public.users[0].czar = false;
                  room.data.public.users[0].points = 0;
                  resetGameRound(room);
                }

                log(`User "${user.name}" left room "${roomID}"`);
  
                serverSocket.emitToOthersInRoom(roomID, WS__MSG_TYPE__USER_LEFT_ROOM, {
                  room: room.data.public,
                });
              }
            }
          }, DISCONNECT_TIMEOUT);
          disconnectChecksForRoom.set(
            disconnectKey(roomID, user.name), 
            disconnectCheck
          );
        }
      });
  
      // game is running, and User re-connected
      if (username) {
        serverSocket.data.user = getUser(room, username);
        const { user } = serverSocket.data;

        if (user) user.connected = true;

        const dKey = disconnectKey(roomID, username);
        const disconnectCheck = disconnectChecksForRoom.get(dKey);
        if (disconnectCheck) {
          clearTimeout(disconnectCheck);
          disconnectChecksForRoom.delete(dKey);
        }

        log(`User "${user.name}" reconnected`);
      }

      serverSocket.emitToAllInRoom(roomID, WS__MSG_TYPE__USER_ENTERED_ROOM, {
        room: room.data.public,
        username,
      });
    }
    else {
      log(`Tried to join room "${roomID}", but it doesn't exist`);
      serverSocket.emitToSelf(WS__MSG_TYPE__ROOM_DESTROYED);
    }
  });
}