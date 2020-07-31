const { middleware: sapperMiddleware } = require('@sapper/server');
const compression = require('compression');
const polka = require('polka');
const sirv = require('sirv');
const {
  black: blackCards,
  white: whiteCards,
} = require('./data.json');

const {
  NODE_ENV,
  PORT = 3000,
} = process.env;
const dev = NODE_ENV === 'development';
const middleware = [
  compression({ threshold: 0 }),
  sirv('static', { dev }),
  sapperMiddleware(),
];

const { server } = polka()
  .use(...middleware)
  .listen(PORT, err => {
    if (err) console.log('error', err);
  });

const io = require('socket.io')(server);

const shuffleCards = (cards) => {
  const _cards = [...cards];
  for (let i = _cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = _cards[i]
    _cards[i] = _cards[j];
    _cards[j] = temp;
  }

  return _cards;
};

io.on('connection', socket => {
  const {
    WS_MSG__CREATE_GAME,
  } = require('./constants');

  // NOTE - `socket.emit` to send to all connected clients.
  // `socket.broadcast.emit` to send to all clients except the one that just
  // sent the message.

  socket.on(WS_MSG__CREATE_GAME, () => {
    socket.emit(WS_MSG__CREATE_GAME, {
      cards: {
        black: shuffleCards(blackCards),
        white: shuffleCards(whiteCards),
      },
      roomID: Math.random().toString(36).substr(2, 4).toUpperCase(),
    });
  });
});
