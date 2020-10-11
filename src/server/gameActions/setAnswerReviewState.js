module.exports = (serverSocket) => function setAnswerReviewState({
  answer = [],
  roomID,
  state,
  username,
}) {
  const { WS__MSG_TYPE__ANSWER_REVIEW_STATE_UPDATED } = require('../../constants');
  const room = serverSocket.getRoom(roomID);
  const { users } = room.data;

  room.data.blackCardAnswer = answer;
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.name === username) {
      Object.assign(user, state);
      break;
    }
  }

  serverSocket.emitToAllInRoom(roomID, WS__MSG_TYPE__ANSWER_REVIEW_STATE_UPDATED, {
    room: room.data,
  });
}