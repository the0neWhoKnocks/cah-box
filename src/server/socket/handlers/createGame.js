module.exports = (socket) => function createGame() {
  const { WS_MSG__CREATE_GAME } = require('../../../constants');
  const {
    black: blackCards,
    white: whiteCards,
  } = require('../../../data.json');
  const generateRoomID = require('../utils/generateRoomID');
  const shuffleArray = require('../utils/shuffleArray');

  socket.emit(WS_MSG__CREATE_GAME, {
    cards: {
      black: shuffleArray(blackCards),
      white: shuffleArray(whiteCards),
    },
    roomID: generateRoomID(),
  });
}