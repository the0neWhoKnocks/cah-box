const log = require('../../utils/logger')('gameActions:removeUserFromRoom');

module.exports = (serverSocket) => function removeUserFromRoom({ admin, roomID, username }) {
  const {
    WS__CLOSE_CODE__USER_REMOVED,
    WS__MSG_TYPE__USER_REMOVED,
  } = require('../../constants');
  const room = serverSocket.getRoom(roomID);

  room.sockets.forEach(socket => {
    if (socket._username === username) {
      const msg = `User "${username}" was removed from room "${roomID}" by "${admin}"`;
      log(msg);
      socket.close(WS__CLOSE_CODE__USER_REMOVED, msg);
    }
  });
  
  serverSocket.emitToAllInRoom(roomID, WS__MSG_TYPE__USER_REMOVED, {
    room: room.data.public,
  });
}
