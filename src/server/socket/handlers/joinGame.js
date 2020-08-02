module.exports = (socket) => function joinGame() {
  const { WS_MSG__JOIN_GAME } = require('../../../constants');

  // socket.emit(WS_MSG__JOIN_GAME, {
  //   cards: {
  //     black: shuffleArray(blackCards),
  //     white: shuffleArray(whiteCards),
  //   },
  //   roomID: generateRoomID(),
  // });
}