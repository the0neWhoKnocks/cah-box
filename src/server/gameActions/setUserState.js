module.exports = (serverSocket) => function setUserState({ roomID, username }, prop) {
  const { WS__MSG_TYPE__USER_UPDATE } = require('../../constants');
  const room = serverSocket.getRoom(roomID);

  for (let i = 0; i < room.data.users.length; i++) {
    const user = room.data.users[i];

    user[prop] = user.name === username;
  }
  
  serverSocket.emitToAllInRoom(roomID, WS__MSG_TYPE__USER_UPDATE, {
    room: room.data,
  });
}