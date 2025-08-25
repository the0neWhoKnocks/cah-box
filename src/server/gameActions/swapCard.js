const log = require('../../utils/logger')('gameActions:swapCard');

module.exports = function swapCard(wss, {
  cardNdx,
  roomID,
  username,
}) {
  const { WS__MSG__CARD_SWAPPED } = require('../../constants');
  const getUser = require('../utils/getUser');
  const room = wss.getRoom(roomID);
  const user = getUser(room, username);
  const {
    private: { cards: { dead, live } },
  } = room.data;
  const oldCard = user.cards[cardNdx];
  const newCard = { ndx: cardNdx, selected: false, text: live.white.shift() };

  log.info(`User "${username}" swapped "${oldCard.text}" for "${newCard.text}"`);

  dead.white.push(oldCard.text);
  user.cards[cardNdx] = newCard;
  user.points -= 1;

  wss.dispatchToAllInRoom(roomID, WS__MSG__CARD_SWAPPED, {
    room: room.data.public,
  });
};
