const getRequiredCount = (blackCard) => {
  const getGaps = require('../../utils/getGaps');
  
  const numOfGaps = getGaps(blackCard).length;
  return (numOfGaps > 1) ? numOfGaps : 1;
};

const CARD_TYPE__BLACK = 'black';
const CARD_TYPE__WHITE = 'white';
const pullCard = (cardType, { dead, live }) => {
  const card = live[cardType].shift();
  
  // If there aren't any left, the last card was pulled, so create a new random
  // stack from the dead cards.
  if (!live[cardType].length) {
    const { PATH__DATA } = require('../../constants');
    const cardData = require(PATH__DATA);
    const shuffleArray = require('../utils/shuffleArray');
    
    live[cardType].push(...shuffleArray(cardData[cardType]));
    dead[cardType].length = 0;
  }
  
  return card;
};

module.exports = function dealCards(wss, { newRound, roomID }) {
  const { WS__MSG__CARDS_DEALT } = require('../../constants');
  const resetGameRound = require('../utils/resetGameRound');
  
  const room = wss.getRoom(roomID);
  const {
    private: { cards },
    public: { users },
  } = room.data;
  const { dead, live } = cards;
  const MAX_CARDS = 10;
  
  if (newRound) {
    resetGameRound(room);
    
    const blackCard = pullCard(CARD_TYPE__BLACK, { dead, live });
    room.data.public.blackCard = blackCard;
    room.data.public.requiredWhiteCardsCount = getRequiredCount(blackCard);
  }
  
  // ensure all users have the required number of cards
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (newRound || !user.cards.length) {
      for (let j = 0; j < MAX_CARDS; j++) {
        if (user.cards.length < MAX_CARDS) {
          user.cards.push({ selected: false, text: pullCard(CARD_TYPE__WHITE, { dead, live }) });
        }
        else break;
      }
    }
  }

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    for (let j = 0; j < user.cards.length; j++) {
      const card = user.cards[j];
      // Ensure the cards have the proper indexing
      card.ndx = j;
      // Ensure cards have been reset to a default state.
      card.selected = false;
    }
  }

  wss.dispatchToAllInRoom(roomID, WS__MSG__CARDS_DEALT, {
    room: room.data.public,
  });
};
