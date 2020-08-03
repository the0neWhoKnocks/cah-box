module.exports = (socket) => function checkUsername({
  roomID,
  username,
}) {
  const { WS_MSG__CHECK_USERNAME } = require('../../../constants');
  const { rooms } = require('../store');
  const payload = { username };

  for (let i = 0; i<rooms[roomID].users.length; i++) {
    if (rooms[roomID].users[i].name === username) {
      payload.error = 'Username exists';
      break;
    }
  }

  socket.emit(WS_MSG__CHECK_USERNAME, payload);
}