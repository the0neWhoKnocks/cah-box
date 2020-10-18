function resetGameRound(room) {
  const { public: { users } } = room.data;

  room.data.public.blackCardAnswer = [];
  room.data.public.submittedCards = [];

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
