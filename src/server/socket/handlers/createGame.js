module.exports = (socket) => function createGame() {
  const { WS_MSG__CREATE_GAME } = require('../../../constants');
  const {
    black: blackCards,
    white: whiteCards,
  } = require('../../../data.json');
  const generateRoomID = require('../utils/generateRoomID');
  const shuffleArray = require('../utils/shuffleArray');
  const { rooms } = require('../store');
  let roomID;

  while (!roomID) {
    const id = generateRoomID();
    if (!rooms[id]) roomID = id;
  }

  rooms[roomID] = {
    blackCardAnswer: [],
    cards: {
      dead: { black: [], white: [] },
      live: {
        black: shuffleArray(blackCards),
        white: shuffleArray(whiteCards),
      },
    },
    submittedCards: [],
    users: [],
  };

  socket.emit(WS_MSG__CREATE_GAME, { roomID });
}