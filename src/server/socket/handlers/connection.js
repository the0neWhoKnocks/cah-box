module.exports = function connection(socket) {
  const {
    WS_MSG__CHECK_USERNAME,
    WS_MSG__CREATE_GAME,
    WS_MSG__DEAL_CARDS,
    WS_MSG__ENTER_ROOM,
    WS_MSG__JOIN_GAME,
    WS_MSG__SET_ADMIN,
    WS_MSG__SET_CZAR,
    WS_MSG__SUBMIT_CARDS,
  } = require('../../../constants');
  const checkUsername = require('./checkUsername');
  const createGame = require('./createGame');
  const dealCards = require('./dealCards');
  const enterRoom = require('./enterRoom');
  const joinGame = require('./joinGame');
  const setUserState = require('./setUserState');
  const submitCards = require('./submitCards');

  socket.on(WS_MSG__CHECK_USERNAME, checkUsername(socket));
  socket.on(WS_MSG__CREATE_GAME, createGame(socket));
  socket.on(WS_MSG__DEAL_CARDS, dealCards(socket));
  socket.on(WS_MSG__ENTER_ROOM, enterRoom(socket));
  socket.on(WS_MSG__JOIN_GAME, joinGame(socket));
  socket.on(WS_MSG__SET_ADMIN, setUserState(socket, 'admin'));
  socket.on(WS_MSG__SET_CZAR, setUserState(socket, 'czar'));
  socket.on(WS_MSG__SUBMIT_CARDS, submitCards(socket));
}