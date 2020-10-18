const log = require('../../utils/logger')('gameActions:enterRoom');

module.exports = (serverSocket) => function enterRoom({ roomID, username }) {
  const {
    WS__MSG_TYPE__ROOM_DESTROYED,
    WS__MSG_TYPE__USER_ENTERED_ROOM,
  } = require('../../constants');

  serverSocket.enterRoom(roomID, username, (room) => {
    if (room) {
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