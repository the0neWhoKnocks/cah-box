module.exports = function choseAnswer(wss, { roomID }) {
  const { WS__MSG__POINTS_AWARDED } = require('../../constants');
  const assignNextCzar = require('../utils/assignNextCzar');
  const dealCards = require('./dealCards');
  const room = wss.getRoom(roomID);
  const {
    private: {
      cards: { dead },
    },
    public: {
      blackCard,
      submittedCards,
      users,
    },
  } = room.data;
  const winner = {};
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
      winner.answer = [...answer.cards];
      winner.blackCard = blackCard;
      winner.name = user.name;
      winner.points = answer.cards.length;
      user.points += answer.cards.length;
      break;
    }
  }

  assignNextCzar(room);
  
  dealCards(wss, { newRound: true, roomID });

  wss.dispatchToAllInRoom(roomID, WS__MSG__POINTS_AWARDED, { ...winner });
}
