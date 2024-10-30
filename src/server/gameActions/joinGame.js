module.exports = function joinGame(wss, { roomID, username }) {
  const { WS__MSG__USER_JOINED } = require('../../constants');
  const getUser = require('../utils/getUser');
  const room = wss.getRoom(roomID);
  const { public: { users } } = room.data;
  let user = getUser(room, username);

  if (!user) {
    user = {
      cards: [],
      cardsSubmitted: false,
      connected: true,
      czar: false,
      host: !users.length,
      maxCardsSelected: false,
      name: username,
      points: 0,
      reviewingAnswers: false,
      reviewNdx: 0,
      selectedCards: [],
      startedReviewingAnswers: false,
    };

    users.push(user);

    wss.data.user = user;
    wss.socket._username = username;
  }

  wss.dispatchToAllInRoom(roomID, WS__MSG__USER_JOINED, {
    room: room.data.public,
    username,
  });
}