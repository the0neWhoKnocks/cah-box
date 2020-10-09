module.exports = () => function setAnswerReviewState({
  answer = [],
  roomID,
  state,
  username,
}) {
  const { WS_MSG__ANSWER_REVIEW_STATE_UPDATED } = require('../../constants');
  const { io, rooms } = require('../socket/store');
  const room = rooms[roomID];
  const { users } = room;

  room.blackCardAnswer = answer;
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.name === username) {
      Object.assign(user, state);
      break;
    }
  }

  io.sockets.in(roomID).emit(WS_MSG__ANSWER_REVIEW_STATE_UPDATED, { room });
}