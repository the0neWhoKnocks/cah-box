const log = require('../../utils/logger')('gameActions:swapCard');

module.exports = (serverSocket) => function swapCard({
  cardNdx,
  roomID,
  username,
}) {
  const { WS__MSG_TYPE__CARD_SWAPPED } = require('../../constants');
  const getUser = require('../utils/getUser');
  const room = serverSocket.getRoom(roomID);
  const user = getUser(room, username);
  const {
    private: { cards: { dead, live } },
  } = room.data;
  const oldCard = user.cards[cardNdx];
  const newCard = { ndx: cardNdx, selected: false, text: live.white.shift() };

  log(`User "${username}" swapped "${oldCard.text}" for "${newCard.text}"`);

  dead.white.push(oldCard.text);
  user.cards[cardNdx] = newCard;
  user.points -= 1;

  serverSocket.emitToAllInRoom(roomID, WS__MSG_TYPE__CARD_SWAPPED, {
    room: room.data.public,
  });
}
