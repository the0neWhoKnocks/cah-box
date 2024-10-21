const { readFileSync } = require('node:fs');
const compression = require('compression');
const polka = require('polka');
const sirv = require('sirv');
const {
  PATH__PUBLIC,
  SERVER__PORT,
  WS__MSG__CHECK_USERNAME,
  WS__MSG__CHOSE_ANSWER,
  WS__MSG__CREATE_GAME,
  WS__MSG__DEAL_CARDS,
  WS__MSG__USER_ENTERED_ROOM,
  WS__MSG__JOIN_GAME,
  WS__MSG__PING,
  WS__MSG__PONG,
  WS__MSG__REMOVE_USER_FROM_ROOM,
  WS__MSG__SERVER_UP,
  WS__MSG__SET_ADMIN,
  WS__MSG__SET_ANSWER_REVIEW_STATE,
  WS__MSG__SET_CZAR,
  WS__MSG__SUBMIT_CARDS,
  WS__MSG__SWAP_CARD,
  WS__MSG__TOGGLE_CARD_SELECTION,
} = require('../constants');
const log = require('../utils/logger')('server');
// TODO switch to socket folder?
const socket = require('./socket.js');
const shell = require('./shell');

const { NODE_ENV } = process.env;
const dev = NODE_ENV !== 'production';
const middleware = [
  compression({ threshold: 0 }),
  sirv(PATH__PUBLIC, { dev, etag: true }),
];
const app = polka();

app
  .use((req, res, next) => {
    if (!res.error) {
      res.error = (...err) => {
        let error;
        let statusCode;
        
        if (typeof err[0] === 'number') {
          const [c, e] = err;
          error = e;
          statusCode = c;
        }
        else if (err[0] instanceof Error) {
          const { message: e, statusCode: c } = err[0];
          error = e;
          statusCode = c;
        }
        
        log.error(`[${statusCode}] | ${error}`);
        // NOTE - utilizing `message` so that if an Error is thrown on the Client
        // within a `then`, there's no extra logic to get error data within the
        // `catch`.
        res.status(statusCode).json({ message: error });
      };
    }
    
    if (!res.json) {
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };
    }
    
    if (!res.status) {
      res.status = (statusCode) => {
        res.statusCode = statusCode;
        return res;
      };
    }
  
    next();
  })
  .use(...middleware)
  // `view` names are usually tied to the `entry` name in your bundler.
  .get('/:roomID', (req, res) => {
    res.end(shell({
      props: req.params,
      view: 'room',
    }));
  })
  .get('/', (req, res) => {
    res.end(shell({
      view: 'home',
    }));
  });

let httpModule;
let protocol = 'http';
let serverOpts = {};
if (process.env.NODE_EXTRA_CA_CERTS) {
  serverOpts.cert = readFileSync(process.env.NODE_EXTRA_CA_CERTS, 'utf8');
  serverOpts.key = readFileSync(process.env.NODE_EXTRA_CA_CERTS.replace('.crt', '.key'), 'utf8');
  httpModule = require('node:https');
  protocol = 'https';
}
else httpModule = require('node:http');

const server = httpModule.createServer(serverOpts, app.handler);
const wss = socket(server, {
  handleClientConnect: require('./socket/handleClientConnect'),
  handleClientDisconnect: require('./socket/handleClientDisconnect'),
  msgHandlers: {
    client: {
      // [WS__MSG__EXAMPLE]: function handleExample(wss, data) {
      //   wss.dispatchToClient(WS__MSG__EXAMPLE, {
      //     msg: `Client: ${data.d} | Server: ${Date.now()}`,
      //   });
      // },
      [WS__MSG__CHECK_USERNAME]: require('./gameActions/checkUsername'),
      [WS__MSG__CHOSE_ANSWER]: require('./gameActions/choseAnswer'),
      [WS__MSG__CREATE_GAME]: require('./gameActions/createGame'),
      [WS__MSG__DEAL_CARDS]: require('./gameActions/dealCards'),
      [WS__MSG__JOIN_GAME]: require('./gameActions/joinGame'),
      [WS__MSG__PING]: function handlePing(wss) {
        wss.dispatchToClient(WS__MSG__PONG);
        // serverSocket.emitToSelf(WS__MSG__PONG);
      },
      [WS__MSG__REMOVE_USER_FROM_ROOM]: require('./gameActions/removeUserFromRoom'),
      [WS__MSG__SET_ADMIN]: require('./gameActions/setUserState')('admin'),
      [WS__MSG__SET_ANSWER_REVIEW_STATE]: require('./gameActions/setAnswerReviewState'),
      [WS__MSG__SET_CZAR]: require('./gameActions/setUserState')('czar'),
      [WS__MSG__SUBMIT_CARDS]: require('./gameActions/submitCards'),
      [WS__MSG__SWAP_CARD]: require('./gameActions/swapCard'),
      [WS__MSG__TOGGLE_CARD_SELECTION]: require('./gameActions/toggleCardSelection'),
      [WS__MSG__USER_ENTERED_ROOM]: require('./gameActions/enterRoom'),
    },
    server: {
      [WS__MSG__SERVER_UP]: function handleServerStart(/* wss */) {
        // TODO: may not be needed
        // log.info('Starting long running process');
        
        // let count = 1;
        // const procInt = setInterval(() => {
        //   if (count < 6) {
        //     wss.dispatchToClients(WS__MSG__EXAMPLE, { msg: `Server process progress: ${count}` });
        //     count += 1;
        //   }
        //   else {
        //     clearInterval(procInt);
        //     wss.dispatchToClients(WS__MSG__EXAMPLE, { msg: 'Server process complete' });
        //   }
        // }, 2000);
      },
    },
  },
});

server.listen(SERVER__PORT, err => {
  if (err) log.error('Error', err);
  log.info(`Server running at: ${protocol}://localhost:${SERVER__PORT}`);
  
  wss.dispatch(WS__MSG__SERVER_UP);
});



















// const compression = require('compression');
// const polka = require('polka');
// const sirv = require('sirv');
// const { SERVER__PORT } = require('../constants');
// const log = require('../utils/logger')('server');
// const socket = require('./socket');
// const shell = require('./shell');

// const {
//   NODE_ENV,
//   PORT = SERVER__PORT,
// } = process.env;
// const dev = NODE_ENV !== 'production';
// const middleware = [
//   compression({ threshold: 0 }),
//   sirv('./dist/public', { dev, etag: true }),
// ];

// const { server } = polka()
//   .use(...middleware)
//   // .all('*', (req, res, next) => {
//   //   console.log('headers', req.headers);
//   //   if (process.env.HEROKU) {
//   //     const forwardedProtoHeader = req.headers['x-forwarded-proto'];
//   //     log(`X-Forwarded-Proto header: "${forwardedProtoHeader}"`);

//   //     next();
//   //   }
//   //   else next();
//   // })
//   .get('/:roomID', (req, res) => {
//     res.end(shell({ page: 'room', params: req.params }));
//   })
//   .get('/', (req, res) => {
//     res.end(shell({ page: 'home' }));
//   })
//   .listen(PORT, err => {
//     if (err) log('Error', err);
//     log(`Server running at: http://localhost:${PORT}`);
//   });

// const serverSocket = socket(server);

// function handleServerDeath(signal) {
//   const { WS__MSG__SERVER_DOWN } = require('../constants');

//   log(`\n[${signal}] Server closing`);
  
//   // NOTE - I've seen this NOT work if there are some zombie WS processes
//   // floating around from a previous bad run. So try killing all `node`
//   // instances and see if things work after.
//   // NOTE - This also only works when the WS isn't being proxied via BrowserSync
//   // while in development. So if you go to the non-proxied port, things will
//   // behave as expected.
//   serverSocket.emitToAll(WS__MSG__SERVER_DOWN);
//   serverSocket.serverInstance.close();
  
//   server.close(() => {
//     log(`[${signal}] Server closed`);
//     process.exit(0);
//   });
// }

// [
//   'SIGINT', 
//   'SIGQUIT',
//   'SIGTERM', 
// ].forEach(signal => process.on(signal, handleServerDeath));
