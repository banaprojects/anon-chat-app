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


sendButton.disabled = true;

textBox.addEventListener("input", () => {
  socket.emit("typing");

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

messageSpace.addEventListener("click", (event) => {
  if (event.target.classList.contains("reply-button")) {
    const originalMessageId = event.target.parentElement.dataset.messageId;
    textBox.value = `Re: ${originalMessageId} - `; 
    textBox.focus();
  }
});

sendButton.addEventListener("click", () => {
  const message = textBox.value.trim();
  if (message !== "") {
    socket.emit("chat message", message);
    textBox.value = "";
    sendButton.disabled = true;
  }
});

socket.on("chat message", (data) => {
  const messageElement = document.createElement("div");
  const usernameDiv = document.createElement("div");
  const lineBreak = document.createElement("br");
  usernameDiv.textContent = data.username + ":";
  usernameDiv.classList.add("username");
  messageElement.classList.add('message');
  messageElement.appendChild(usernameDiv);
  messageElement.appendChild(lineBreak);
  messageElement.appendChild(document.createTextNode(data.message));

  if(data.username === username){
    messageElement.classList.add("sent-message");
  } else{
    messageElement.classList.add("received-message");
  }

  messageSpace.appendChild(messageElement);
  messageSpace.scrollTop = messageSpace.scrollHeight;
});

// socket.on("user joined", (username) => {
//   const messageElement = document.createElement("div");
//   messageElement.textContent = `${username} has joined the chat`;
//   messageElement.classList.add("join-message");
//   messageSpace.appendChild(messageElement);
//   messageSpace.scrollTop = messageSpace.scrollHeight;
// });

// socket.on("user left", (username) => {
//   const messageElement = document.createElement("div");
//   messageElement.textContent = `${username} has left the chat`;
//   messageElement.classList.add("join-message");
//   messageSpace.appendChild(messageElement);
//   messageSpace.scrollTop = messageSpace.scrollHeight;
// });

socket.on("users", (users) => {
  updateUserList(users);
});

function updateUserList(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const memberDiv = document.createElement("div");
    const listItem = document.createElement("li");
    listItem.textContent = user;
    memberDiv.classList.add("active-user-div");
    listItem.classList.add("user");
    memberDiv.appendChild(listItem);
    userList.appendChild(memberDiv);
  });
}

// socket.on("typing", (data) => {
//   typingIndicator.textContent = `${data.username} is typing...`;
//   typingIndicator.style.display = "block";
//   typingIndicator.classList.add("typing-indicator");
//   messageSpace.appendChild(typingIndicator);
// });

// socket.on("stop typing", () => {
//   typingIndicator.style.display = "none";
// });
