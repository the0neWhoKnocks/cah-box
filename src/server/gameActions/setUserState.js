module.exports = (socket, prop) => function setUserState({ roomID, username }) {
  const { WS_MSG__USER_UPDATE } = require('../../constants');
  const { io, rooms } = require('../socket/store');

  for (let i = 0; i < rooms[roomID].users.length; i++) {
    const user = rooms[roomID].users[i];

    user[prop] = user.name === username;
  }
  
  io.sockets.in(roomID).emit(WS_MSG__USER_UPDATE, {
    room: rooms[roomID],
  });
}