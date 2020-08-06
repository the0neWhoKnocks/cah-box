const getRequiredCount = (blackCard) => {
  const numOfGaps = (blackCard.match(/(_+)/g) || []).length;
  return (numOfGaps > 1) ? numOfGaps : 1;
};

module.exports = () => function dealCards({ roomID }) {
  const { WS_MSG__CARDS_DEALT } = require('../../../constants');
  const { io, rooms } = require('../store');
  const { cards, users } = rooms[roomID];
  const { live } = cards;
  const MAX_CARDS = 10;
  const blackCard = live.black.shift();

  rooms[roomID].submittedCards = {};
  
  for (let i = 0; i < MAX_CARDS; i++) {
    for (let j = 0; j < users.length; j++) {
      const user = users[j];

      user.cardsSubmitted = false;

      if (user.cards.length < MAX_CARDS) user.cards.push({
        selected: false,
        text: live.white.shift(),
      });
    }
  }

  io.sockets.in(roomID).emit(WS_MSG__CARDS_DEALT, {
    blackCard,
    requiredWhiteCardsCount: getRequiredCount(blackCard), 
    users,
  });
}