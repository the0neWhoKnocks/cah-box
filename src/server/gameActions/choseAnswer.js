module.exports = (serverSocket) => function choseAnswer({ roomID }) {
  const assignNextCzar = require('../utils/assignNextCzar');
  const dealCards = require('./dealCards');
  const room = serverSocket.getRoom(roomID);
  const { blackCard, cards: { dead }, submittedCards, users } = room.data;
  let answer;

  dead.black.push(blackCard);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.czar) {
      answer = submittedCards[user.reviewNdx];
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

  assignNextCzar(room);
  
  dealCards(serverSocket)({ newRound: true, roomID });
}