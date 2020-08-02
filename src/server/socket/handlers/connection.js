module.exports = function connection(socket) {
  const {
    WS_MSG__CREATE_GAME,
    WS_MSG__JOIN_GAME,
  } = require('../../../constants');
  const createGame = require('./createGame');
  const joinGame = require('./joinGame');

  socket.on(WS_MSG__CREATE_GAME, createGame(socket));
  socket.on(WS_MSG__JOIN_GAME, joinGame(socket));
}