module.exports = (socket) => function checkUsername({
  roomID,
  username,
}) {
  const {
    ERROR_CODE__NAME_TAKEN,
    ERROR_CODE__ROOM_DOES_NOT_EXIST,
    WS_MSG__CHECK_USERNAME,
  } = require('../../constants');
  const { rooms } = require('../socket/store');
  const payload = { username };
  const room = rooms[roomID];

  if (room) {
    for (let i = 0; i<rooms[roomID].users.length; i++) {
      if (rooms[roomID].users[i].name === username) {
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

  socket.emit(WS_MSG__CHECK_USERNAME, payload);
}