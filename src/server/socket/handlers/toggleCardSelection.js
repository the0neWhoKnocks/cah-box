module.exports = (socket) => function toggleCardSelection({ ndx, roomID, username }) {
  const { WS_MSG__CARD_SELECTION_TOGGLED } = require('../../../constants');
  const { rooms } = require('../store');
  const { requiredWhiteCardsCount, users } = rooms[roomID];
  
  for (let i = 0; i < users.length; i++) {
    const user = rooms[roomID].users[i];

    if (user.name === username) {
      user.cards[ndx].selected = !user.cards[ndx].selected;

      const selectedCount = user.cards.filter(({ selected }) => selected).length;

      user.maxCardsSelected = selectedCount === requiredWhiteCardsCount;

      break;
    }
  }

  socket.emit(WS_MSG__CARD_SELECTION_TOGGLED, {
    room: rooms[roomID],
  });
}