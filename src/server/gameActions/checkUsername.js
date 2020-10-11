module.exports = (serverSocket) => function checkUsername({
  roomID,
  username,
}) {
  const {
    ERROR_CODE__NAME_TAKEN,
    ERROR_CODE__ROOM_DOES_NOT_EXIST,
    WS__MSG_TYPE__CHECK_USERNAME,
  } = require('../../constants');
  const payload = { username };
  const room = serverSocket.getRoom(roomID);

  if (room) {
    for (let i = 0; i<room.data.users.length; i++) {
      if (room.data.users[i].name === username) {
        payload.error = {
          code: ERROR_CODE__NAME_TAKEN,
          msg: 'Username exists',
        };
        break;
      }
    }
  }
  else {
    payload.error = {
      code: ERROR_CODE__ROOM_DOES_NOT_EXIST,
      msg: `Room ${roomID} doesn't seem to exist anymore.`,
    };
  }

  serverSocket.emitToSelf(WS__MSG_TYPE__CHECK_USERNAME, payload);
}