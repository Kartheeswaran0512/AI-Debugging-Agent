function getUserName(user) {
  return user ? user.name.toUpperCase() : "GUEST";
}

module.exports = { getUserName };
