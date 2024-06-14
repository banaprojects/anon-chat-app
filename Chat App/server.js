const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = {};
const messages = []; // Array to store messages

app.use(express.static(__dirname));

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send stored messages and usernames to the newly connected client
  socket.emit("initial data", { messages, users: Object.values(users) });

  socket.on("set username", (username) => {
    if (Object.values(users).includes(username)) {
      socket.emit("username taken", username);
      return;
    }

    users[socket.id] = username;
    io.emit("users", Object.values(users));
    console.log("Current users:", users);
    socket.broadcast.emit("user joined", username);
  });

  socket.on("chat message", (msg) => {
    const messageData = {
      username: users[socket.id],
      message: msg,
      timeStamp: new Date().toLocaleTimeString()
    };
    messages.push(messageData); // Store the message
    io.emit("chat message", messageData);
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing", { username: users[socket.id] });
  });

  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", users[socket.id]);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    console.log("User disconnected:", users[socket.id]);
    delete users[socket.id];
    io.emit("users", Object.values(users));
    if (username) {
      socket.broadcast.emit("user left", username);
    }

    io.emit("user count", Object.keys(users).length);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
