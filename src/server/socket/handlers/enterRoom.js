module.exports = (socket) => function enterRoom({ roomID, username }) {
  const {
    WS_MSG__USER_ENTERED_ROOM,
    WS_MSG__USER_LEFT_ROOM,
  } = require('../../../constants');
  const assignNextAdmin = require('../utils/assignNextAdmin');
  const assignNextCzar = require('../utils/assignNextCzar');
  const getUser = require('../utils/getUser');
  const resetGameRound = require('../utils/resetGameRound');
  const { io, rooms } = require('../store');
  const room = rooms[roomID];

  socket.join(roomID, () => {
    if (room) {
      socket.on('disconnect', () => {
        if (socket.user) {
          socket.user.connected = false;

          // if a User refreshed their Browser, `connected` will be set back to
          // `true` fairly quickly. The timeout value is a guesstimate based on a
          // User having assets cached so the reload time should be quick.
          setTimeout(() => {
            const { user } = socket;
            if (!user.connected) {
              const { cards: { live } } = room;
              const { admin, cards, czar } = user;
              
              // user is Admin, assign next admin
              if (admin) assignNextAdmin(roomID);
              
              // user is Czar, assign next czar
              if (czar) assignNextCzar(roomID, true);
              
              // remove the User
              room.users = room.users.filter(({ name }) => name !== user.name);

              // dump white cards back into `live` cards
              cards.forEach(({ text }) => { live.white.push(text); });

              // if there aren't enough players, put game back into a waiting state
              if (room.users.length === 1) {
                room.users[0].czar = false;
                room.users[0].points = 0;
                resetGameRound(roomID);
              }
              
              io.to(roomID).emit(WS_MSG__USER_LEFT_ROOM, { room });
            }
          }, 1000);
        }
      });
    }

    // game is running, and User refreshed Browser
    if (room && username) {
      socket.user = getUser(roomID, username);
      socket.user.connected = true;
    }

    socket.emit(WS_MSG__USER_ENTERED_ROOM, { room, username });
  });
}