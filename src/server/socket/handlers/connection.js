module.exports = function connection(socket) {
  const { WS_MSG__CREATE_GAME } = require('../../../constants');
  const createGame = require('./createGame');

  socket.on(WS_MSG__CREATE_GAME, createGame(socket));
}