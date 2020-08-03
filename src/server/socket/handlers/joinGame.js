module.exports = () => function joinGame({ roomID, username }) {
  const { WS_MSG__USER_JOINED } = require('../../../constants');
  const { io, rooms } = require('../store');
  const user = { name: username };

  if (!rooms[roomID].users.length) {
    user.active = true;
    user.admin = true;
  }

  rooms[roomID].users.push(user);
  
  io.sockets.in(roomID).emit(WS_MSG__USER_JOINED, {
    username,
    users: rooms[roomID].users,
  });
}