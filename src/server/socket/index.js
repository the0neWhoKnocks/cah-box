module.exports = function socket(server) {
  const io = require('socket.io')(server);
  const connection = require('./handlers/connection');
  const store = require('./store');

  store.io = io;
  
  io.on('connection', connection);
}