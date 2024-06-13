const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = {}; // Store connected users

app.use(express.static(__dirname)); // Serve your HTML and other files

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("set username", (username) => {
    // Basic sanitization to prevent XSS attacks
    username = username.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    //Check for unique username
    if (Object.values(users).includes(username)) {
      socket.emit("username taken", username);
      return;
    }

    users[socket.id] = username;
    io.emit("users", Object.values(users)); // Send updated user list to everyone
    console.log("Current users:", users); // Log current users for debugging
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", { username: users[socket.id], message: msg });
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing", { username: users[socket.id] }); // Broadcast to other users
  });

  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", users[socket.id]); // Broadcast to other users
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", users[socket.id]); // Log disconnected user
    delete users[socket.id];
    io.emit("users", Object.values(users)); // Update user list on disconnect
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
