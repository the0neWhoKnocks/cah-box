const log = require('../../utils/logger')('gameActions:createGame');

module.exports = function createGame(wss) {
  const { 
    PATH__DATA,
    WS__MSG__CREATE_GAME,
  } = require('../../constants');
  const {
    black: blackCards,
    white: whiteCards,
  } = require(PATH__DATA);
  const generateRoomID = require('../utils/generateRoomID');
  const shuffleArray = require('../utils/shuffleArray');
  let roomID;

  // It's possible that a room ID was already generated and in use, so keep
  // generating one until a unique one is found.
  while (!roomID) {
    const id = generateRoomID();
    if (!wss.getRoom(id)) roomID = id;
  }

  wss.createRoom(roomID, {
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

  log.info(`Created new room "${roomID}"`);

  // wss.emitToSelf(WS__MSG__CREATE_GAME, { roomID });
  wss.dispatchToClient(WS__MSG__CREATE_GAME, { roomID });
}