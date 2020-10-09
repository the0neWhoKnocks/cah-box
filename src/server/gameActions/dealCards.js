const getGaps = require('../../utils/getGaps');

const getRequiredCount = (blackCard) => {
  const numOfGaps = getGaps(blackCard).length;
  return (numOfGaps > 1) ? numOfGaps : 1;
};

module.exports = () => function dealCards({ newRound, roomID }) {
  const { WS_MSG__CARDS_DEALT } = require('../../constants');
  const resetGameRound = require('../utils/resetGameRound');
  const { io, rooms } = require('../socket/store');
  const { cards, users } = rooms[roomID];
  const { live } = cards;
  const MAX_CARDS = 10;
  
  if (newRound) {
    resetGameRound(roomID);

    const blackCard = live.black.shift();
    rooms[roomID].blackCard = blackCard;
    rooms[roomID].requiredWhiteCardsCount = getRequiredCount(blackCard);
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

  io.sockets.in(roomID).emit(WS_MSG__CARDS_DEALT, {
    room: rooms[roomID],
  });
}