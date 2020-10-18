const log = require('../../utils/logger')('gameActions:createGame');

module.exports = (serverSocket) => function createGame() {
  const { WS__MSG_TYPE__CREATE_GAME } = require('../../constants');
  const {
    black: blackCards,
    white: whiteCards,
  } = require('../../data.json');
  const generateRoomID = require('../utils/generateRoomID');
  const shuffleArray = require('../utils/shuffleArray');
  let roomID;

  // It's possible that a room ID was already generated and in use, so keep
  // generating one until a unique one is found.
  while (!roomID) {
    const id = generateRoomID();
    if (!serverSocket.getRoom(id)) roomID = id;
  }

  serverSocket.createRoom(roomID, {
    private: {
      cards: {
        dead: { black: [], white: [] },
        live: {
          black: shuffleArray(blackCards),
          white: shuffleArray(whiteCards),
        },
      },
    },
    public: {
      blackCardAnswer: [],
      submittedCards: [],
      users: [],
    },
  });

  log(`Created new room "${roomID}"`);

  serverSocket.emitToSelf(WS__MSG_TYPE__CREATE_GAME, { roomID });
}