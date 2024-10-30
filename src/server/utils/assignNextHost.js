module.exports = function assignNextHost(room) {
  const { public: { users } } = room.data;
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user.host) {
      if (i === users.length - 1) users[0].host = true;
      else users[i + 1].host = true;

      user.host = false;

      break;
    }
  }
}
