module.exports = () => function choseAnswer({ roomID }) {
  const dealCards = require('./dealCards');
  const { rooms } = require('../store');
  const room = rooms[roomID];
  const { cards: { dead }, users } = room;
  let czarUpdated = false;
  let answer;

  dead.black.push(room.blackCard);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.czar && !czarUpdated) {
      answer = room.submittedCards[user.reviewNdx];

      if (i === users.length - 1) users[0].czar = true;
      else users[i + 1].czar = true;

      delete user.czar;
      czarUpdated = true;
    }
  }

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.name === answer.username) {
      user.points += answer.cards.length;
      break;
    }
  }
  
  dealCards()({ newRound: true, roomID });
}