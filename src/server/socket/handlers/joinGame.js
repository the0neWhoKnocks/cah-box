module.exports = (socket) => function joinGame({ roomID, username }) {
  const { WS_MSG__USER_JOINED } = require('../../../constants');
  const getUser = require('../utils/getUser');
  const { io, rooms } = require('../store');
  const room = rooms[roomID];
  const { users } = room;
  let user = getUser(roomID, username);

  if (!user) {
    user = {
      admin: !users.length,
      cards: [],
      cardsSubmitted: false,
      connected: true,
      czar: false,
      maxCardsSelected: false,
      name: username,
      points: 0,
      reviewingAnswers: false,
      reviewNdx: 0,
      selectedCards: [],
      startedReviewingAnswers: false,
    };

    users.push(user);

    socket.user = user;
  }

  io.sockets.in(roomID).emit(WS_MSG__USER_JOINED, { room, username });
}