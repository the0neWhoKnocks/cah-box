module.exports = () => function joinGame({ roomID, username }) {
  const { WS_MSG__USER_JOINED } = require('../../../constants');
  const { io, rooms } = require('../store');
  const { users } = rooms[roomID];
  const user = {
    cards: [],
    name: username,
    reviewingAnswers: false,
    reviewNdx: 0,
    startedReviewingAnswers: false,
  };

  if (!users.length) user.admin = true;

  users.push(user);
  
  io.sockets.in(roomID).emit(WS_MSG__USER_JOINED, {
    room: rooms[roomID],
    username,
  });
}