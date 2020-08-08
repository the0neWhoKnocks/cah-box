module.exports = (socket) => function toggleCardSelection({ ndx, roomID, username }) {
  const { WS_MSG__CARD_SELECTION_TOGGLED } = require('../../../constants');
  const { rooms } = require('../store');
  const { requiredWhiteCardsCount, users } = rooms[roomID];
  
  for (let i = 0; i < users.length; i++) {
    const user = rooms[roomID].users[i];

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

  socket.emit(WS_MSG__CARD_SELECTION_TOGGLED, {
    room: rooms[roomID],
  });
}