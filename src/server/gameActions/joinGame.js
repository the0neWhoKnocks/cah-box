module.exports = (serverSocket) => function joinGame({ roomID, username }) {
  const { WS__MSG_TYPE__USER_JOINED } = require('../../constants');
  const getUser = require('../utils/getUser');
  const room = serverSocket.getRoom(roomID);
  const { users } = room.data;
  let user = getUser(room, username);

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

    serverSocket.data.user = user;
  }

  serverSocket.emitToAllInRoom(roomID, WS__MSG_TYPE__USER_JOINED, {
    room: room.data,
    username,
  });
}