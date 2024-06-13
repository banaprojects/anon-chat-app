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

const typingIndicator = document.createElement("p");
typingIndicator.textContent = "Someone is typing...";
typingIndicator.style.display = "none";
messageSpace.appendChild(typingIndicator);

sendButton.disabled = true;

textBox.addEventListener("input", () => {
  socket.emit("typing"); // Emit "typing" on every keystroke

  sendButton.disabled = textBox.value.trim() === "";
  errorMessage.textContent = "";
});

textBox.addEventListener("blur", () => {
  socket.emit("stop typing");
});

textBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendButton.click();
  }
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
  const usernameDiv = document.createElement("div");
  usernameDiv.textContent = data.username + ": ";
  usernameDiv.classList.add("username");
  messageElement.appendChild(usernameDiv);
  messageElement.appendChild(document.createTextNode(data.message));

  messageSpace.appendChild(messageElement);
  messageSpace.scrollTop = messageSpace.scrollHeight;
});

socket.on("users", (users) => {
  updateUserList(users);
});

function updateUserList(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const listItem = document.createElement("li");
    listItem.textContent = user;
    userList.appendChild(listItem);
  });
}

socket.on("typing", (data) => {
  typingIndicator.textContent = `${data.username} is typing...`;
  typingIndicator.style.display = "block";
});

socket.on("stop typing", () => {
  typingIndicator.style.display = "none";
});


