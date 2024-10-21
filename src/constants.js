// Shared by both Client and Server
const constants = {
  APP__TITLE: 'CAH-Box',
  DISCONNECT_TIMEOUT: 5000,
  DOM__SVELTE_MOUNT_POINT: 'view',
  ERROR_CODE__NAME_TAKEN: 101,
  ERROR_CODE__ROOM_DOES_NOT_EXIST: 100,
  NAMESPACE__LOGGER: 'cahbox',
  WS__CLOSE_CODE__USER_REMOVED: 4000, // Close event numbers https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
  WS__MSG__ANSWER_REVIEW_STATE_UPDATED: 'answer review state updated',
  WS__MSG__CARD_SELECTION_TOGGLED: 'card selection toggled',
  WS__MSG__CARD_SWAPPED: 'card swapped',
  WS__MSG__CARDS_DEALT: 'cards dealt',
  WS__MSG__CARDS_SUBMITTED: 'cards submitted',
  WS__MSG__CHECK_USERNAME: 'check username',
  WS__MSG__CHOSE_ANSWER: 'chose answer',
  WS__MSG__CONNECTED_TO_SERVER: 'connected to server',
  WS__MSG__CREATE_GAME: 'create game',
  WS__MSG__DEAL_CARDS: 'deal cards',
  WS__MSG__JOIN_GAME: 'join game',
  WS__MSG__PING: 'ping',
  WS__MSG__PONG: 'pong',
  WS__MSG__POINTS_AWARDED: 'points awarded',
  WS__MSG__REMOVE_USER_FROM_ROOM: 'remove user from room',
  WS__MSG__ROOM_DESTROYED: 'room destroyed',
  WS__MSG__SERVER_DOWN: 'server down',
  WS__MSG__SERVER_UP: 'server up',
  WS__MSG__SET_ADMIN: 'set admin',
  WS__MSG__SET_ANSWER_REVIEW_STATE: 'set answer review state',
  WS__MSG__SET_CZAR: 'set czar',
  WS__MSG__SUBMIT_CARDS: 'submit cards',
  WS__MSG__SWAP_CARD: 'swap card',
  WS__MSG__TOGGLE_CARD_SELECTION: 'toggle card selection',
  WS__MSG__USER_DISCONNECTED: 'user disconnected',
  WS__MSG__USER_ENTERED_ROOM: 'user entered room',
  WS__MSG__USER_JOINED: 'user joined',
  WS__MSG__USER_LEFT_ROOM: 'user left room',
  WS__MSG__USER_REMOVED: 'user removed',
  WS__MSG__USER_UPDATE: 'user update',
};

if (!process.env.FOR_CLIENT_BUNDLE) {
  // Server only (will be stripped out via WP)
  const { resolve } = require('node:path');
  
  const ROOT_PATH = resolve(__dirname, './');
  
  Object.assign(constants, {
    PATH__PUBLIC: `${ROOT_PATH}/public`,
    SERVER__PORT: +process.env.SERVER_PORT || 3000,
  });
}

module.exports = constants;
