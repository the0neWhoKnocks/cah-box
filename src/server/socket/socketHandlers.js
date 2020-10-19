const log = require('../../utils/logger')('socket:socketHandlers');
const logHeartbeat = require('../../utils/logger')('socket:socketHandlers:heartbeat');

module.exports = function connection(socket, serverSocket) {
  const {
    WS__MSG_TYPE__CHECK_USERNAME,
    WS__MSG_TYPE__CHOSE_ANSWER,
    WS__MSG_TYPE__CREATE_GAME,
    WS__MSG_TYPE__DEAL_CARDS,
    WS__MSG_TYPE__USER_ENTERED_ROOM,
    WS__MSG_TYPE__JOIN_GAME,
    WS__MSG_TYPE__PING,
    WS__MSG_TYPE__PONG,
    WS__MSG_TYPE__REMOVE_USER_FROM_ROOM,
    WS__MSG_TYPE__SET_ADMIN,
    WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE,
    WS__MSG_TYPE__SET_CZAR,
    WS__MSG_TYPE__SUBMIT_CARDS,
    WS__MSG_TYPE__SWAP_CARD,
    WS__MSG_TYPE__TOGGLE_CARD_SELECTION,
  } = require('../../constants');
  const checkUsername = require('../gameActions/checkUsername')(serverSocket);
  const choseAnswer = require('../gameActions/choseAnswer')(serverSocket);
  const createGame = require('../gameActions/createGame')(serverSocket);
  const dealCards = require('../gameActions/dealCards')(serverSocket);
  const enterRoom = require('../gameActions/enterRoom')(serverSocket);
  const joinGame = require('../gameActions/joinGame')(serverSocket);
  const removeUserFromRoom = require('../gameActions/removeUserFromRoom')(serverSocket);
  const setAnswerReviewState = require('../gameActions/setAnswerReviewState')(serverSocket);
  const setUserState = require('../gameActions/setUserState')(serverSocket);
  const submitCards = require('../gameActions/submitCards')(serverSocket);
  const swapCard = require('../gameActions/swapCard')(serverSocket);
  const toggleCardSelection = require('../gameActions/toggleCardSelection')(serverSocket);

  socket.on('message', (payload) => {
    const { data, type } = JSON.parse(payload);
    const _log = (type === WS__MSG_TYPE__PING) ? logHeartbeat : log;
    
    _log(`[HANDLE] "${type}"`);

    switch (type) {
      case WS__MSG_TYPE__CHECK_USERNAME: checkUsername(data); break;
      case WS__MSG_TYPE__CHOSE_ANSWER: choseAnswer(data); break;
      case WS__MSG_TYPE__CREATE_GAME: createGame(data); break;
      case WS__MSG_TYPE__DEAL_CARDS: dealCards(data); break;
      case WS__MSG_TYPE__JOIN_GAME: joinGame(data); break;
      case WS__MSG_TYPE__PING: {
        serverSocket.emitToSelf(WS__MSG_TYPE__PONG);
        break;
      }
      case WS__MSG_TYPE__REMOVE_USER_FROM_ROOM: removeUserFromRoom(data); break;
      case WS__MSG_TYPE__SET_ADMIN: setUserState(data, 'admin'); break;
      case WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE: setAnswerReviewState(data); break;
      case WS__MSG_TYPE__SET_CZAR: setUserState(data, 'czar'); break;
      case WS__MSG_TYPE__SUBMIT_CARDS: submitCards(data); break;
      case WS__MSG_TYPE__SWAP_CARD: swapCard(data); break;
      case WS__MSG_TYPE__TOGGLE_CARD_SELECTION: toggleCardSelection(data); break;
      case WS__MSG_TYPE__USER_ENTERED_ROOM: enterRoom(data); break;
      default: {
        log(`[WARN] Message type "${type}" is not valid, no action taken data:`, data);
      }
    }
  });

  socket.on('close', (code, reason) => {
    const {
      DISCONNECT_TIMEOUT,
      WS__CLOSE_CODE__USER_REMOVED,
      WS__MSG_TYPE__ROOM_DESTROYED,
      WS__MSG_TYPE__USER_DISCONNECTED,
      WS__MSG_TYPE__USER_LEFT_ROOM,
    } = require('../../constants');
    const assignNextAdmin = require('../utils/assignNextAdmin');
    const assignNextCzar = require('../utils/assignNextCzar');
    const resetGameRound = require('../utils/resetGameRound');
    const dealCards = require('../gameActions/dealCards');

    const { roomID, user } = serverSocket.data;
    const room = serverSocket.getRoom(roomID);
    
    if (room) {
      if (user) {
        user.connected = false;
  
        serverSocket.emitToOthersInRoom(roomID, WS__MSG_TYPE__USER_DISCONNECTED, {
          room: room.data.public,
        });

        const timeoutDuration = (code === WS__CLOSE_CODE__USER_REMOVED)
          ? 0
          : DISCONNECT_TIMEOUT;
  
        // if a User refreshed their Browser, `connected` will be set back to
        // `true` fairly quickly. The timeout value is a guesstimate based on a
        // User having assets cached so the reload time should be quick.
        const disconnectCheck = setTimeout(() => {
          if (!user.connected) {
            const { private: { cards: { live } } } = room.data;
            const { admin, cards, czar } = user;
            
            // user is Admin, assign next admin
            if (admin) assignNextAdmin(room);
            
            // user is Czar, assign next czar
            if (czar) {
              assignNextCzar(room, true);
              dealCards(serverSocket)({ newRound: true, roomID });
            }
            
            // remove the User
            room.data.public.users = room.data.public.users.filter(({ name }) => name !== user.name);
  
            // if all Users have left, kill the room
            if (!room.data.public.users.length) {
              log(`All Users have left, killing room "${roomID}"`);
  
              // it's possible that a User is in the process of joining when
              // the Admin left the room, so lets tell them that the room no
              // longer exists.
              serverSocket.emitToSelf(WS__MSG_TYPE__ROOM_DESTROYED);
  
              serverSocket.deleteRoom(roomID);
            }
            else {
              // dump white cards back into `live` cards
              cards.forEach(({ text }) => { live.white.push(text); });
  
              // if there aren't enough players, put game back into a waiting state
              if (room.data.public.users.length === 1) {
                room.data.public.users[0].czar = false;
                room.data.public.users[0].points = 0;
                resetGameRound(room);
              }
  
              log(
                code === WS__CLOSE_CODE__USER_REMOVED
                  ? reason
                  : `User "${user.name}" left room "${roomID}" due to disconnection`
              );
              
              const socketNdx = room.sockets.indexOf(serverSocket.socket);
              if (socketNdx > -1) room.sockets.splice(socketNdx, 1);
  
              serverSocket.emitToOthersInRoom(roomID, WS__MSG_TYPE__USER_LEFT_ROOM, {
                room: room.data.public,
              });
            }
          }
        }, timeoutDuration);

        serverSocket.leaveRoom(roomID, user.name, disconnectCheck);

        log(`User "${user.name}" disconnected from room "${roomID}" while a game was running`);
      }
      else {
        log(`User disconnected from room "${roomID}" that they didn't join`);
        
        if (!room.data.public.users.length) {
          log(`No users in room "${roomID}", killing it`);
          serverSocket.deleteRoom(roomID);
        }
      }
    }
    else {
      log('User disconnected');
    }
  });
}