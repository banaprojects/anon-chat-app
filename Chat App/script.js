const socket = io();
let username;

function askForUsername() {
  username = prompt("Please enter your username:");
  socket.emit("set username", username);
}

askForUsername();

socket.on("username taken", () => {
  alert("Username already taken. Please choose another one.");
  askForUsername();
});

const textBox = document.getElementById("text-box");
const sendButton = document.querySelector(".send-btn");
const messageSpace = document.querySelector(".message-space");
const userList = document.getElementById("user-list");
const errorMessage = document.createElement("div");
errorMessage.classList.add("error-message");
messageSpace.after(errorMessage);

sendButton.disabled = true;

textBox.addEventListener("input", () => {
  sendButton.disabled = textBox.value.trim() === "";
  errorMessage.textContent = "";
});

sendButton.addEventListener("click", () => {
  const message = textBox.value.trim();
  if (message !== "") {
    socket.emit("chat message", message);
    textBox.value = "";
    sendButton.disabled = true; 
  } else {
    errorMessage.textContent = "Please enter a message.";
  }
});

socket.on("chat message", (data) => {
  const messageElement = document.createElement("div");
  messageElement.textContent = `${data.username}: ${data.message}`;
  messageSpace.appendChild(messageElement);
  messageSpace.scrollTop = messageSpace.scrollHeight;
});

socket.on("users", (users) => {
  updateUserList(users);
});

function updateUserList(users) {
  userList.innerHTML = "Active Users: ";
  users.forEach((user) => {
    const listItem = document.createElement("li");
    listItem.textContent = user;
    userList.appendChild(listItem);
  });
}
