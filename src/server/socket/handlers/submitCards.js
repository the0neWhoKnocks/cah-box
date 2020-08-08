module.exports = () => function submitCards({
  cards: submittedCards,
  roomID,
  username,
}) {
  const { WS_MSG__CARDS_SUBMITTED } = require('../../../constants');
  const shuffleArray = require('../utils/shuffleArray');
  const { io, rooms } = require('../store');
  const { cards: { dead }, users } = rooms[roomID];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.name === username) {
      user.cardsSubmitted = true;
      // remove the submitted card from the User's deck
      user.cards = user.cards.filter(({ text: card }) => {
        dead.white.push(card);
        return submittedCards.includes(card);
      });
      // add cards
      rooms[roomID].submittedCards.push({ cards: submittedCards, username });
    }
  }
  
  // shuffle answers once all Users have submitted
  if (rooms[roomID].submittedCards.length === (users.length - 1)) {
    rooms[roomID].submittedCards = shuffleArray(rooms[roomID].submittedCards);
    // users.forEach((user) => { user.cardsSubmitted = false; });
  }
  
  io.sockets.in(roomID).emit(WS_MSG__CARDS_SUBMITTED, {
    room: rooms[roomID],
  });
}