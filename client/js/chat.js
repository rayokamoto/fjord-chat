// Chatting feature - deals with messages

const chatText = document.getElementById("chat-text");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

// send data to server
chatForm.onsubmit = (e) => {
    e.preventDefault(); // prevents the enter key from refreshing page
    socket.emit('sendMsgToServer', chatInput.value);
    chatInput.value = '';
}


function scrollWin(x, y) {
    chatText.scrollBy(x, y);
}

function getTimestamp() {
    let date = new Date();
    let hours = date.getHours(); 
    let mins = date.getMinutes();
    if (String(mins).length !== 2) {
        mins = `0${mins}`
    }
    let timestamp = `<p class="chat-timestamp">Sent at ${hours}:${mins}</p>`;
    return timestamp;
}

function messageFormat(user, message) {
    timestamp = getTimestamp();
    return `<b>${user}</b> ${timestamp}<br>${message}`;
}


// add received data (messages) into the chat "stream"
socket.on('addChatMsg', (data) => {
    finalMessage = messageFormat(data.user, data.message);
    chatText.innerHTML += `<div class="chat-msg">${finalMessage}</div>`;
    scrollWin(0, 100);
});

// add alerts into the chat
socket.on('addChatAlert', (data) => {
    chatText.innerHTML += `<div class="chat-alert">${data}</div>`;
    scrollWin(0, 50);
});
