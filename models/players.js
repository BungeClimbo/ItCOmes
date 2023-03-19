const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  socketID: {
    type: String
  },
  points: {
    type: Number,
    default: 0
  },
  playerType: {
    // will be "red" or "blue"
    required: true,
    type: String
  },
  headPosition: {
    required: true,
    type: Number
  },
  startGame: {
    required: true,
    type: Boolean
  }
});

module.exports = playerSchema;
