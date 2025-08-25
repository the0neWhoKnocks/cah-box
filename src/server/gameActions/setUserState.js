module.exports = (roll) => function setUserState(wss, { roomID, username }) {
  const { WS__MSG__USER_UPDATE } = require('../../constants');
  const room = wss.getRoom(roomID);

  for (let i = 0; i < room.data.public.users.length; i++) {
    const user = room.data.public.users[i];

    user[roll] = user.name === username;
  }
  
  wss.dispatchToAllInRoom(roomID, WS__MSG__USER_UPDATE, {
    room: room.data.public,
  });
};
