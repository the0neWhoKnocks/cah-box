const assignNextCzar = (room, userLeftRoom) => {
  const { public: { users } } = room.data;
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.czar) {
      const maxRequired = userLeftRoom ? 2 : 1;
      // in case Users leave during a game
      if (users.length > maxRequired) {
        if (i === users.length - 1) users[0].czar = true;
        else users[i + 1].czar = true;
      }

      user.czar = false;

      break;
    }
  }
};

module.exports = assignNextCzar;
