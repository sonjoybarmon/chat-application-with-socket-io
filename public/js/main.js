const chatForm = document.getElementById("chat-form");
const chatMessage = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// console.log(username, room);

let socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outPutUsers(users);
});

// message form server
socket.on("message", (message) => {
  outputMessage(message);

  // scroll down
  chatMessage.scrollTop = chatMessage.scrollHeight;
});

// message submit
chatForm.addEventListener("submit", (e) => {
  const msg = e.target.elements.msg.value;

  // send to message server
  socket.emit("chatMessage", msg);

  // clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();

  e.preventDefault();
});

// Output message to DOM element
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
            <p class="text">
             ${message.text}
            </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// add room name to dom

function outputRoomName(room) {
  roomName.innerText = room;
}
// add users to DOM

function outPutUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  } else {
  }
});
