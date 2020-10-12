module.exports = (serverSocket) => function submitCards({
  roomID,
  username,
}) {
  const { WS__MSG_TYPE__CARDS_SUBMITTED } = require('../../constants');
  const room = serverSocket.getRoom(roomID);
  const shuffleArray = require('../utils/shuffleArray');
  const {
    private: { cards: { dead } },
    public: { submittedCards, users },
  } = room.data;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.name === username) {
      const selectedCards = user.selectedCards.map(({ text }) => text);

      user.cardsSubmitted = true;
      // remove the submitted card from the User's deck
      user.cards = user.cards.filter(({ text: card }) => {
        const cardSelected = selectedCards.includes(card);
        if (cardSelected) dead.white.push(card);
        return !cardSelected;
      });
      // add cards
      submittedCards.push({ cards: selectedCards, username });
    }
  }
  
  // shuffle answers once all Users have submitted
  if (submittedCards.length === (users.length - 1)) {
    room.data.public.submittedCards = shuffleArray(submittedCards);
  }
  
  serverSocket.emitToAllInRoom(roomID, WS__MSG_TYPE__CARDS_SUBMITTED, {
    room: room.data.public,
  });
}