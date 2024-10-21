module.exports = function setAnswerReviewState(wss, {
  answer = [],
  roomID,
  state,
  username,
}) {
  const { WS__MSG__ANSWER_REVIEW_STATE_UPDATED } = require('../../constants');
  const room = wss.getRoom(roomID);
  const { public: { users } } = room.data;

  room.data.public.blackCardAnswer = answer;
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.name === username) {
      Object.assign(user, state);
      break;
    }
  }

  wss.dispatchToAllInRoom(roomID, WS__MSG__ANSWER_REVIEW_STATE_UPDATED, {
    room: room.data.public,
  });
}