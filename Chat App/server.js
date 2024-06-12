const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = {}; 

app.use(express.static(__dirname)); 
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("set username", (username) => {
        username = username.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    
    if (Object.values(users).includes(username)) {
      socket.emit("username taken", username);
      return;
    }

    users[socket.id] = username;
    io.emit("users", Object.values(users));
    console.log("Current users:", users); 
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", { username: users[socket.id], message: msg });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", users[socket.id]); 
    delete users[socket.id];
    io.emit("users", Object.values(users)); 
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
