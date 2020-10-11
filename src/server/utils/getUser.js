const getUser = (room, username) => {
  
  if (room) {
    const { users } = room.data;
    return users.filter(({ name }) => name === username)[0];
  }
};

module.exports = getUser;
