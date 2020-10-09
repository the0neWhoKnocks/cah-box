module.exports = function connection(socket) {
  const {
    WS_MSG__CHECK_USERNAME,
    WS_MSG__CHOSE_ANSWER,
    WS_MSG__CREATE_GAME,
    WS_MSG__DEAL_CARDS,
    WS_MSG__USER_ENTERED_ROOM,
    WS_MSG__JOIN_GAME,
    WS_MSG__SET_ADMIN,
    WS_MSG__SET_ANSWER_REVIEW_STATE,
    WS_MSG__SET_CZAR,
    WS_MSG__SUBMIT_CARDS,
    WS_MSG__TOGGLE_CARD_SELECTION,
  } = require('../../constants');
  const checkUsername = require('../gameActions/checkUsername');
  const choseAnswer = require('../gameActions/choseAnswer');
  const createGame = require('../gameActions/createGame');
  const dealCards = require('../gameActions/dealCards');
  const enterRoom = require('../gameActions/enterRoom');
  const joinGame = require('../gameActions/joinGame');
  const setAnswerReviewState = require('../gameActions/setAnswerReviewState');
  const setUserState = require('../gameActions/setUserState');
  const submitCards = require('../gameActions/submitCards');
  const toggleCardSelection = require('../gameActions/toggleCardSelection');

  socket.on(WS_MSG__CHECK_USERNAME, checkUsername(socket));
  socket.on(WS_MSG__CHOSE_ANSWER, choseAnswer(socket));
  socket.on(WS_MSG__CREATE_GAME, createGame(socket));
  socket.on(WS_MSG__DEAL_CARDS, dealCards(socket));
  socket.on(WS_MSG__USER_ENTERED_ROOM, enterRoom(socket));
  socket.on(WS_MSG__JOIN_GAME, joinGame(socket));
  socket.on(WS_MSG__SET_ADMIN, setUserState(socket, 'admin'));
  socket.on(WS_MSG__SET_ANSWER_REVIEW_STATE, setAnswerReviewState(socket));
  socket.on(WS_MSG__SET_CZAR, setUserState(socket, 'czar'));
  socket.on(WS_MSG__SUBMIT_CARDS, submitCards(socket));
  socket.on(WS_MSG__TOGGLE_CARD_SELECTION, toggleCardSelection(socket));
}