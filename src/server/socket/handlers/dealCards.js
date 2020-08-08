const getGaps = require('../../../utils/getGaps');

const getRequiredCount = (blackCard) => {
  const numOfGaps = getGaps(blackCard).length;
  return (numOfGaps > 1) ? numOfGaps : 1;
};

module.exports = () => function dealCards({ newRound, roomID }) {
  const { WS_MSG__CARDS_DEALT } = require('../../../constants');
  const { io, rooms } = require('../store');
  const { cards, users } = rooms[roomID];
  const { live } = cards;
  const MAX_CARDS = 10;
  
  if (newRound) {
    const blackCard = live.black.shift();
    rooms[roomID].blackCard = blackCard;
    rooms[roomID].blackCardAnswer = [];
    rooms[roomID].requiredWhiteCardsCount = getRequiredCount(blackCard);
    rooms[roomID].submittedCards = [];
  }
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (newRound || !user.cards.length) {
      user.cardsSubmitted = false;
      user.maxCardsSelected = false;

      for (let j = 0; j < MAX_CARDS; j++) {
        if (user.cards.length < MAX_CARDS) {
          user.cards.push({ selected: false, text: live.white.shift() });
        }
        else break;
      }
    }
  }

  io.sockets.in(roomID).emit(WS_MSG__CARDS_DEALT, {
    room: rooms[roomID],
  });
}