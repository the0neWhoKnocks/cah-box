const log = require('../../utils/logger')('gameActions:enterRoom');

module.exports = function enterRoom(wss, { roomID, username }) {
  const {
    WS__MSG__ROOM_DESTROYED,
    WS__MSG__USER_ENTERED_ROOM,
  } = require('../../constants');

  wss.enterRoom(roomID, username, (room) => {
    if (room) {
      wss.dispatchToAllInRoom(roomID, WS__MSG__USER_ENTERED_ROOM, {
        room: room.data.public,
        username,
      });
    }
    else {
      log.info(`Tried to join room "${roomID}", but it doesn't exist`);
      wss.dispatchToClient(WS__MSG__ROOM_DESTROYED);
    }
  });
}