module.exports = (serverSocket) => function toggleCardSelection({ ndx, roomID, username }) {
  const { WS__MSG_TYPE__CARD_SELECTION_TOGGLED } = require('../../constants');
  const room = serverSocket.getRoom(roomID);
  const { public: { requiredWhiteCardsCount, users } } = room.data;
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.name === username) {
      const card = user.cards[ndx];
      card.selected = !card.selected;

      if (card.selected) user.selectedCards.push(card);
      else user.selectedCards = user.selectedCards.filter(({ text }) => card.text !== text);

      const selectedCount = user.cards.filter(({ selected }) => selected).length;

      user.maxCardsSelected = selectedCount === requiredWhiteCardsCount;

      break;
    }
  }

  serverSocket.emitToSelf(WS__MSG_TYPE__CARD_SELECTION_TOGGLED, {
    room: room.data.public,
  });
}