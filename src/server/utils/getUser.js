const getUser = (room, username) => {
  if (room) {
    const { public: { users } } = room.data;
    return users.filter(({ name }) => name === username)[0];
  }
};

module.exports = getUser;
