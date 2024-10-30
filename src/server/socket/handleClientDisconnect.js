const log = require('../../utils/logger')('socket.handleClientDisconnect');

module.exports = function handleClientDisconnect(wss, code, reason) {
  const {
    DISCONNECT_TIMEOUT,
    WS__CLOSE_CODE__DISCONNECTED,
    WS__CLOSE_CODE__USER_REMOVED,
    WS__MSG__ROOM_DESTROYED,
    WS__MSG__USER_DISCONNECTED,
    WS__MSG__USER_LEFT_ROOM,
  } = require('../../constants');
  const assignNextCzar = require('../utils/assignNextCzar');
  const assignNextHost = require('../utils/assignNextHost');
  const resetGameRound = require('../utils/resetGameRound');
  const dealCards = require('../gameActions/dealCards');

  const { roomID, user } = wss.data;
  const room = wss.getRoom(roomID);
  
  if (room) {
    if (user) {
      user.connected = false;

      wss.dispatchToOthersInRoom(roomID, WS__MSG__USER_DISCONNECTED, {
        room: room.data.public,
      });

      const timeoutDuration = (code === WS__CLOSE_CODE__USER_REMOVED)
        ? 0
        : DISCONNECT_TIMEOUT;

      // if a User refreshed their Browser, `connected` will be set back to
      // `true` fairly quickly. The timeout value is a guesstimate based on a
      // User having assets cached so the reload time should be quick.
      const disconnectCheck = setTimeout(() => {
        if (!user.connected) {
          const { private: { cards: { live } } } = room.data;
          const { cards, czar, host } = user;
          
          // user is Host, assign next Host
          if (host) assignNextHost(room);
          
          // user is Czar, assign next Czar
          if (czar) {
            assignNextCzar(room, true);
            dealCards(wss, { newRound: true, roomID });
          }
          
          // remove the User
          room.data.public.users = room.data.public.users.filter(({ name }) => name !== user.name);

          // if all Users have left, kill the room
          if (!room.data.public.users.length) {
            log.info(`All Users have left, killing room "${roomID}"`);

            // it's possible that a User is in the process of joining when
            // the Host left the room, so lets tell them that the room no
            // longer exists.
            wss.dispatchToOthersInRoom(roomID, WS__MSG__ROOM_DESTROYED);

            wss.deleteRoom(roomID);
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

            log.info(
              [
                WS__CLOSE_CODE__DISCONNECTED,
                WS__CLOSE_CODE__USER_REMOVED,
              ].includes(code)
                ? reason
                : `User "${user.name}" left room "${roomID}" due to disconnection`
            );
            
            const socketNdx = room.sockets.indexOf(wss.socket);
            if (socketNdx > -1) room.sockets.splice(socketNdx, 1);

            wss.dispatchToOthersInRoom(roomID, WS__MSG__USER_LEFT_ROOM, {
              room: room.data.public,
            });
          }
        }
      }, timeoutDuration);

      wss.leaveRoom(roomID, user.name, disconnectCheck);

      log.info(`User "${user.name}" disconnected from room "${roomID}" while a game was running`);
    }
    else {
      log.info(`User disconnected from room "${roomID}" that they didn't join`);
      
      if (!room.data.public.users.length) {
        log.info(`No users in room "${roomID}", killing it`);
        wss.deleteRoom(roomID);
      }
    }
  }
  else {
    log.info('User disconnected');
  }
}
