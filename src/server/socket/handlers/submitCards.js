module.exports = () => function submitCards({
  cards: submittedCards,
  roomID,
  username,
}) {
  const { WS_MSG__CARDS_SUBMITTED } = require('../../../constants');
  const { io, rooms } = require('../store');
  const { cards: { dead }, users } = rooms[roomID];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.name === username) {
      user.cardsSubmitted = true;
      user.cards = user.cards.filter(({ text }) => submittedCards.includes(text));
      break;
    }
  }

  submittedCards.forEach((card) => dead.white.push(card));
  
  rooms[roomID].submittedCards[username] = submittedCards;
  
  io.sockets.in(roomID).emit(WS_MSG__CARDS_SUBMITTED, {
    submittedCards: rooms[roomID].submittedCards,
    users,
  });
}