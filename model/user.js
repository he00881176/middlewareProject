const mongoose = require("mongoose");

let userScema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
});

const User = new mongoose.model("User", userScema);

module.exports = User;
