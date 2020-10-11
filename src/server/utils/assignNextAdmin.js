const assignNextAdmin = (room) => {
  const { users } = room.data;
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user.admin) {
      if (i === users.length - 1) users[0].admin = true;
      else users[i + 1].admin = true;

      user.admin = false;

      break;
    }
  }
};

module.exports = assignNextAdmin;
