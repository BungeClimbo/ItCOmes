// importing everything
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 10000;
const server = http.createServer(app);

const Room = require("./models/room");

var io = require("socket.io")(server);

//client -> middleware -> server
//middleware

app.use(express.json());

const DB =
  "mongodb+srv://Tortobloss:Donalddavison1@cluster0.dvoevej.mongodb.net/?retryWrites=true&w=majority";

io.on("connection", socket => {
  console.log("a user connected");
  console.log("new update");
  socket.on("createGame", async ({ name, roomName }) => {
    console.log(name);
    try {
      // room is created
      const query = { roomName: roomName };
      let rooms = [];

      let room = await Room.findOne(query);
      rooms.push(room);
      if (!rooms.includes(null)) {
        console.log("name exists");
        socket.emit("errorOccurred", "Room name exists");
      } else {
        let room = new Room();
        room.roomName = roomName;
        let socketID = {
          socketID: socket.id
        };
        room.socketID.push(socketID);
        let player = {
          socketID: socket.id,
          name: name,
          playerType: "red",
          headPosition: 50,
          startGame: false
        };

        room.players.push(player);

        // player stored in room
        room = await room.save();
        console.log(room.players[0].name);
        const roomId = room._id.toString();
        socket.join(roomId);
        // tell our client that the room is created go to other page
        io.to(roomId).emit("createRoomSuccess", room);
      }
    } catch (e) {
      console.log(e);
    }
  });
  // join room
  socket.on("joinRoom", async ({ name, roomName }) => {
    const query = { roomName: roomName };
    let rooms = [];

    let room = await Room.findOne(query);
    rooms.push(room);
    try {
      if (rooms.includes(null)) {
        console.log("name exists");
        socket.emit("errorOccurred", "Room Does not exist");
      } else {
        if (room.isJoin) {
          let roomId = room._id;
          let player = {
            name,
            socketID: socket.id,
            playerType: "blue",
            headPosition: 100,
            startGame: false
          };
          socket.join(roomId);
          room.players.push(player);
          room.isJoin = false;
          room = await room.save();

          io.to(roomId).emit("joinRoomSuccess", room);
          io.to(roomId).emit("updatePlayers", room.players);
          io.to(roomId).emit("updateRoom", room);
        } else {
          socket.emit(
            "errorOccurred",
            "The game is in progress, try again later."
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  });
  socket.on("movePlayerOne", async ({ snakeHead, roomId, isPlayer1 }) => {
    let room = await Room.findById(roomId);

    room.players[0].headPosition = snakeHead;
    room = await room.save();
    io.to(roomId).emit("playerOneMoved", room.players);
  });
  socket.on("movePlayerTwo", async ({ snakeHead, roomId, isPlayer1 }) => {
    let room = await Room.findById(roomId);
    room.players[1].headPosition = snakeHead;
    room = await room.save();
    io.to(roomId).emit("playerTwoMoved", room.players);
  });

  socket.on("startGame", async ({ isPlayer1, roomId }) => {
    let room = await Room.findById(roomId);
    if (isPlayer1) {
      room.players[0].startGame = true;
    } else {
      room.players[1].startGame = true;
    }
    console.log(room.players[0].startGame);
    console.log(room.players[1].startGame);
    room = await room.save();
    io.to(roomId).emit("updatePlayers", room.players);
  });
  socket.on("eatFood", async ({ newFoodPosition, roomId }) => {
    let room = await Room.findById(roomId);

    room.foodPosition = newFoodPosition;
    room = await room.save();
    console.log("new Food Position " + newFoodPosition);
    io.to(roomId).emit("newFoodPosition", room.foodPosition);
  });
  socket.on("endGame", async ({ roomId }) => {
    let room = await Room.findById(roomId);
    room.players[0].startGame = false;
    room.players[1].startGame = false;
    room.players[0].headPosition = 50;
    room.players[1].headPosition = 100;
    room.foodPosition = 75;

    room = await room.save();
    io.to(roomId).emit("updatePlayers", room.players);
  });
  socket.on("disconnecting", async () => {
    console.log(socket.id); // the Set contains at least the socket ID
    const query = { socketID: { socketID: socket.id } };
    let room = await Room.findOneAndDelete(query);
    console.log(room);
  });
});

mongoose
  .connect(DB)
  .then(() => {
    console.log("succesfully connected to database");
  })
  .catch(e => {
    console.log("very unfortunataru no database for you");
  });

server.listen(port, "0.0.0.0", () => {
  console.log("server started and running on port " + port);
});
