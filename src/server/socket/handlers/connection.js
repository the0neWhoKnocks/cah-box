module.exports = function connection(socket) {
  const {
    WS_MSG__CHECK_USERNAME,
    WS_MSG__CREATE_GAME,
    WS_MSG__ENTER_ROOM,
    WS_MSG__JOIN_GAME,
  } = require('../../../constants');
  const checkUsername = require('./checkUsername');
  const createGame = require('./createGame');
  const enterRoom = require('./enterRoom');
  const joinGame = require('./joinGame');

  socket.on(WS_MSG__CHECK_USERNAME, checkUsername(socket));
  socket.on(WS_MSG__CREATE_GAME, createGame(socket));
  socket.on(WS_MSG__ENTER_ROOM, enterRoom(socket));
  socket.on(WS_MSG__JOIN_GAME, joinGame(socket));
}