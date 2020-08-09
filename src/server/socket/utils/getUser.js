const getUser = (roomID, username) => {
  const { rooms } = require('../store');
  
  if (rooms[roomID]) {
    const { users } = rooms[roomID];
    return users.filter(({ name }) => name === username)[0];
  }
};

module.exports = getUser;
