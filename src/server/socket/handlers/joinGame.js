module.exports = () => function joinGame({ roomID, username }) {
  const { WS_MSG__USER_JOINED } = require('../../../constants');
  const { io, rooms } = require('../store');
  const user = {
    cards: [],
    name: username,
  };

  if (!rooms[roomID].users.length) user.admin = true;

  rooms[roomID].users.push(user);
  
  io.sockets.in(roomID).emit(WS_MSG__USER_JOINED, {
    username,
    users: rooms[roomID].users,
  });
}