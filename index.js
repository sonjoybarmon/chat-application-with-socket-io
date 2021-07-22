const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "SREE World";

// socket io server
io.on("connection", (socket) => {
  // console.log("new user active");
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //  welcome current user active
    socket.emit("message", formatMessage(botName, "welcome to Devs world"));

    // Broadcast when a user connects
    //   socket.broadcast.emit("message", "A user has joined the chat");
    io.sockets
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // send users and room information
    // io.sockets.to(user.room).emit("roomUsers", {
    io.sockets.emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  // //  welcome current user active
  // socket.emit("message", formatMessage(botName, "welcome to Devs world"));

  // // Broadcast when a user connects
  // //   socket.broadcast.emit("message", "A user has joined the chat");
  // io.sockets.emit(
  //   "message",
  //   formatMessage(botName, "A user has joined the chat")
  // );

  // receives chat message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.sockets.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.sockets
        .to(user.room)
        .emit(
          "message",
          formatMessage(botName, `${user.username} has left the Chat`)
        );

      // send users and room information
      // io.sockets.to(user.room).emit("roomUsers", {
      io.sockets.emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }

    // // send users and room information
    // io.to(user.room).emit("roomUsers", {
    //   room: user.room,
    //   users: getRoomUsers(user.room),
    // });
  });
});

const PORT = 8000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
