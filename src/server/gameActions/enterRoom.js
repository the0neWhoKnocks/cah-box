module.exports = (serverSocket) => function enterRoom({ roomID, username }) {
  const {
    WS__MSG_TYPE__ROOM_DESTROYED,
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
        console.log('Client disconnected');
  
        const { user } = serverSocket.data;
  
        if (user) {
          user.connected = false;
  
          // if a User refreshed their Browser, `connected` will be set back to
          // `true` fairly quickly. The timeout value is a guesstimate based on a
          // User having assets cached so the reload time should be quick.
          user.disconnectCheck = setTimeout(() => {
            if (!user.connected) {
              const { cards: { live } } = room.data;
              const { admin, cards, czar } = user;
              
              // user is Admin, assign next admin
              if (admin) assignNextAdmin(room);
              
              // user is Czar, assign next czar
              if (czar) {
                assignNextCzar(room, true);
                dealCards(serverSocket)({ newRound: true, roomID });
              }
              
              // remove the User
              room.data.users = room.data.users.filter(({ name }) => name !== user.name);
  
              // if all Users have left, kill the room
              if (!room.data.users.length) {
                console.log(`All Users have left, killing room "${roomID}"`);
  
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
                if (room.data.users.length === 1) {
                  room.data.users[0].czar = false;
                  room.data.users[0].points = 0;
                  resetGameRound(room);
                }
  
                serverSocket.emitToOthersInRoom(roomID, WS__MSG_TYPE__USER_LEFT_ROOM, {
                  room: room.data,
                });
              }
            }
          }, 1000);
        }
      });
  
      // game is running, and User refreshed Browser
      if (username) {
        serverSocket.data.user = getUser(room, username);
        const { user } = serverSocket.data;

        if (user) {
          user.connected = true;

          if (user.disconnectCheck) {
            clearTimeout(user.disconnectCheck);
            delete user.disconnectCheck;
          }
        }
      }
  
      serverSocket.emitToSelf(WS__MSG_TYPE__USER_ENTERED_ROOM, {
        room: room.data,
        username,
      });
    }
    else {
      serverSocket.emitToSelf(WS__MSG_TYPE__ROOM_DESTROYED);
    }
  });
}