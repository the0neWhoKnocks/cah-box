module.exports = (socket) => function createGame() {
  const { WS_MSG__CREATE_GAME } = require('../../../constants');
  const {
    black: blackCards,
    white: whiteCards,
  } = require('../../../data.json');
  const generateRoomID = require('../utils/generateRoomID');
  const shuffleArray = require('../utils/shuffleArray');
  const { rooms } = require('../store');
  const roomID = generateRoomID();

  rooms[roomID] = {
    cards: {
      dead: { black: [], white: [] },
      live: {
        black: shuffleArray(blackCards),
        white: shuffleArray(whiteCards),
      },
    },
    users: [],
  };

  socket.emit(WS_MSG__CREATE_GAME, { roomID });
}