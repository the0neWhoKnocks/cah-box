module.exports = () => function choseAnswer({ roomID }) {
  const assignNextCzar = require('../utils/assignNextCzar');
  const dealCards = require('./dealCards');
  const { rooms } = require('../store');
  const room = rooms[roomID];
  const { cards: { dead }, users } = room;
  let answer;

  dead.black.push(room.blackCard);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.czar) {
      answer = room.submittedCards[user.reviewNdx];
      break;
    }
  }

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.name === answer.username) {
      user.points += answer.cards.length;
      break;
    }
  }

  assignNextCzar(roomID);
  
  dealCards()({ newRound: true, roomID });
}