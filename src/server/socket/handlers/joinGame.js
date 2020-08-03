module.exports = () => function joinGame({ roomID, username }) {
  const { WS_MSG__USER_JOINED } = require('../../../constants');
  const { io, rooms } = require('../store');

  rooms[roomID].users.push({ name: username });
  
  io.sockets.in(roomID).emit(WS_MSG__USER_JOINED, {
    users: rooms[roomID].users,
  });
}