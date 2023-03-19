const mongoose = require("mongoose");
const playerSchema = require("./players");

const roomSchema = new mongoose.Schema({
  occupancy: {
    type: Number,
    default: 2
  },
  maxRounds: {
    type: Number,
    default: 6
  },
  currentRound: {
    required: true,
    type: Number,
    default: 1
  },
  players: [playerSchema],
  isJoin: {
    type: Boolean,
    default: true
  },
  foodPosition: {
    type: Number,
    default: 75
  },
  roomName: {
    type: String,
    default: "",
    trim: true
  },
  socketID: []
});

const roomModel = mongoose.model("Room", roomSchema);
module.exports = roomModel;
