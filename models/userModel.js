const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

function readUsersFromFile() {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeUsersToFile(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

module.exports = {
  getAllUsers: function () {
    return readUsersFromFile();
  },
  findUserByUsername: function (username) {
    const users = readUsersFromFile();
    return users.find(user => user.username === username);
  },
  findUserById: function (id) {
    const users = readUsersFromFile();
    return users.find(user => user.id === id);
  },
  addUser: function (user) {
    const users = readUsersFromFile();
    users.push(user);
    writeUsersToFile(users);
  },
  updateUser: function (updatedUser) {
    const users = readUsersFromFile();
    const index = users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      writeUsersToFile(users);
      return true;
    }
    return false;
  }
};
