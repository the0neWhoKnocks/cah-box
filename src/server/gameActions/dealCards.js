const getGaps = require('../../utils/getGaps');

const getRequiredCount = (blackCard) => {
  const numOfGaps = getGaps(blackCard).length;
  return (numOfGaps > 1) ? numOfGaps : 1;
};

module.exports = (serverSocket) => function dealCards({ newRound, roomID }) {
  const { WS__MSG_TYPE__CARDS_DEALT } = require('../../constants');
  const resetGameRound = require('../utils/resetGameRound');
  const room = serverSocket.getRoom(roomID);
  const { cards, users } = room.data;
  const { live } = cards;
  const MAX_CARDS = 10;
  
  if (newRound) {
    resetGameRound(room);

    const blackCard = live.black.shift();
    room.data.blackCard = blackCard;
    room.data.requiredWhiteCardsCount = getRequiredCount(blackCard);
  }
  
  // ensure all users have the required number of cards
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (newRound || !user.cards.length) {
      for (let j = 0; j < MAX_CARDS; j++) {
        if (user.cards.length < MAX_CARDS) {
          user.cards.push({ selected: false, text: live.white.shift() });
        }
        else break;
      }
    }
  }

  // ensure the cards have the proper indexing
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    for (let j = 0; j < user.cards.length; j++) {
      const card = user.cards[j];
      card.ndx = j;
    }
  }

  serverSocket.emitToAllInRoom(roomID, WS__MSG_TYPE__CARDS_DEALT, {
    room: room.data,
  });
}