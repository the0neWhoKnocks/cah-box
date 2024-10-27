const log = require('../../utils/logger')('gameActions:removeUserFromRoom');

module.exports = function removeUserFromRoom(wss, { admin, roomID, username }) {
  const {
    WS__CLOSE_CODE__USER_REMOVED,
    WS__MSG__USER_REMOVED,
  } = require('../../constants');
  const room = wss.getRoom(roomID);

  room.sockets.forEach(socket => {
    if (socket._username === username) {
      const msg = `User "${username}" was removed from room "${roomID}" by "${admin}"`;
      log.info(msg);
      socket.close(WS__CLOSE_CODE__USER_REMOVED, msg);
    }
  });
  
  wss.dispatchToAllInRoom(roomID, WS__MSG__USER_REMOVED, {
    room: room.data.public,
  });
}
