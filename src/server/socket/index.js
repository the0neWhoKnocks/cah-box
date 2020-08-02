module.exports = function socket(server) {
  const io = require('socket.io')(server);
  const connection = require('./handlers/connection');
  
  io.on('connection', connection);
}
