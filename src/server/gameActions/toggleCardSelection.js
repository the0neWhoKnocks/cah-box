module.exports = function toggleCardSelection(wss, { ndx, roomID, username }) {
  const { WS__MSG__CARD_SELECTION_TOGGLED } = require('../../constants');
  const room = wss.getRoom(roomID);
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

  wss.dispatchToClient(WS__MSG__CARD_SELECTION_TOGGLED, {
    room: room.data.public,
  });
};
