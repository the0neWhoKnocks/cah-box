module.exports = (socket) => function enterRoom({ roomID, username }) {
  const { WS_MSG__ENTER_ROOM } = require('../../../constants');
  const { rooms } = require('../store');

  socket.join(roomID, () => {
    socket.emit(WS_MSG__ENTER_ROOM, {
      roomData: rooms[roomID],
      username,
    });
  });
}