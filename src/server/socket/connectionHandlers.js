module.exports = function connection(socket, serverSocket) {
  const {
    WS__MSG_TYPE__CHECK_USERNAME,
    WS__MSG_TYPE__CHOSE_ANSWER,
    WS__MSG_TYPE__CREATE_GAME,
    WS__MSG_TYPE__DEAL_CARDS,
    WS__MSG_TYPE__USER_ENTERED_ROOM,
    WS__MSG_TYPE__JOIN_GAME,
    WS__MSG_TYPE__SET_ADMIN,
    WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE,
    WS__MSG_TYPE__SET_CZAR,
    WS__MSG_TYPE__SUBMIT_CARDS,
    WS__MSG_TYPE__TOGGLE_CARD_SELECTION,
  } = require('../../constants');
  const checkUsername = require('../gameActions/checkUsername')(serverSocket);
  const choseAnswer = require('../gameActions/choseAnswer')(serverSocket);
  const createGame = require('../gameActions/createGame')(serverSocket);
  const dealCards = require('../gameActions/dealCards')(serverSocket);
  const enterRoom = require('../gameActions/enterRoom')(serverSocket);
  const joinGame = require('../gameActions/joinGame')(serverSocket);
  const setAnswerReviewState = require('../gameActions/setAnswerReviewState')(serverSocket);
  const setUserState = require('../gameActions/setUserState')(serverSocket);
  const submitCards = require('../gameActions/submitCards')(serverSocket);
  const toggleCardSelection = require('../gameActions/toggleCardSelection')(serverSocket);
  
  socket.on('message', (payload) => {
    const { data, type } = JSON.parse(payload);
    console.log(`[SERVER_SOCKET] Received ${payload}`);
    
    switch (type) {
      case WS__MSG_TYPE__CHECK_USERNAME: checkUsername(data); break;
      case WS__MSG_TYPE__CHOSE_ANSWER: choseAnswer(data); break;
      case WS__MSG_TYPE__CREATE_GAME: createGame(data); break;
      case WS__MSG_TYPE__DEAL_CARDS: dealCards(data); break;
      case WS__MSG_TYPE__USER_ENTERED_ROOM: enterRoom(data); break;
      case WS__MSG_TYPE__JOIN_GAME: joinGame(data); break;
      case WS__MSG_TYPE__SET_ADMIN: setUserState(data, 'admin'); break;
      case WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE: setAnswerReviewState(data); break;
      case WS__MSG_TYPE__SET_CZAR: setUserState(data, 'czar'); break;
      case WS__MSG_TYPE__SUBMIT_CARDS: submitCards(data); break;
      case WS__MSG_TYPE__TOGGLE_CARD_SELECTION: toggleCardSelection(data); break;
      default: {
        console.log(`[WARN] Message type "${type}" is not valid, no action taken data:`, data);
      }
    }
  });
}