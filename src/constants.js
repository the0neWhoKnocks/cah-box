module.exports = {
  APP__TITLE: 'CAH-Box',
  DISCONNECT_TIMEOUT: 5000,
  DOM__SVELTE_MOUNT_POINT: 'route',
  ERROR_CODE__NAME_TAKEN: 101,
  ERROR_CODE__ROOM_DOES_NOT_EXIST: 100,
  SERVER__PORT: +process.env.SERVER_PORT || 3000,
  // Close event numbers https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
  WS__CLOSE_CODE__USER_REMOVED: 4000,
  WS__MSG_TYPE__ANSWER_REVIEW_STATE_UPDATED: 'answer review state updated',
  WS__MSG_TYPE__CARD_SELECTION_TOGGLED: 'card selection toggled',
  WS__MSG_TYPE__CARDS_DEALT: 'cards dealt',
  WS__MSG_TYPE__CARDS_SUBMITTED: 'cards submitted',
  WS__MSG_TYPE__CHECK_USERNAME: 'check username',
  WS__MSG_TYPE__CHOSE_ANSWER: 'chose answer',
  WS__MSG_TYPE__CREATE_GAME: 'create game',
  WS__MSG_TYPE__DEAL_CARDS: 'deal cards',
  WS__MSG_TYPE__JOIN_GAME: 'join game',
  WS__MSG_TYPE__PING: 'ping',
  WS__MSG_TYPE__PONG: 'pong',
  WS__MSG_TYPE__POINTS_AWARDED: 'points awarded',
  WS__MSG_TYPE__REMOVE_USER_FROM_ROOM: 'remove user from room',
  WS__MSG_TYPE__ROOM_DESTROYED: 'room destroyed',
  WS__MSG_TYPE__SERVER_DOWN: 'server down',
  WS__MSG_TYPE__SET_ADMIN: 'set admin',
  WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE: 'set answer review state',
  WS__MSG_TYPE__SET_CZAR: 'set czar',
  WS__MSG_TYPE__SUBMIT_CARDS: 'submit cards',
  WS__MSG_TYPE__SWAP_CARD: 'swap card',
  WS__MSG_TYPE__TOGGLE_CARD_SELECTION: 'toggle card selection',
  WS__MSG_TYPE__USER_DISCONNECTED: 'user disconnected',
  WS__MSG_TYPE__USER_ENTERED_ROOM: 'user entered room',
  WS__MSG_TYPE__USER_JOINED: 'user joined',
  WS__MSG_TYPE__USER_LEFT_ROOM: 'user left room',
  WS__MSG_TYPE__USER_REMOVED: 'user removed',
  WS__MSG_TYPE__USER_UPDATE: 'user update',
};