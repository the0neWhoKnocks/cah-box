const { middleware: sapperMiddleware } = require('@sapper/server');
const compression = require('compression');
const polka = require('polka');
const sirv = require('sirv');
const socket = require('./socket');

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

socket(server);

function handleServerDeath(signal) {
  const { WS_MSG__SERVER_DOWN } = require('../constants');
  const { io } = require('./socket/store');
  
  console.log(`\n[${signal}] Server closing`);
  
  if (io) io.sockets.emit(WS_MSG__SERVER_DOWN);
  
  server.close(() => {
    console.log(`[${signal}] Server closed`);
    process.exit(0);
  });
}

[
  'SIGINT', 
  'SIGQUIT',
  'SIGTERM', 
].forEach(signal => process.on(signal, handleServerDeath));
