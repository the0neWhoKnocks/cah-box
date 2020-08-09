function resetGameRound(roomID) {
  const { rooms } = require('../store');
  const room = rooms[roomID];
  const { users } = room;

  room.blackCardAnswer = [];
  room.submittedCards = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    user.cardsSubmitted = false;
    user.maxCardsSelected = false;
    user.reviewingAnswers = false;
    user.reviewNdx = 0;
    user.selectedCards = [];
    user.startedReviewingAnswers = false;
  }
}

module.exports = resetGameRound;
