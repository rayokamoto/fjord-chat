 // initialise io socket stream
const socket = io();

const errorMessage = document.getElementsByClassName('error-message')

// sign up
const startScreen = document.getElementById('startScreen');
const startScreenUsername = document.getElementById('startScreen-username');
const startScreenSignup = document.getElementById('startScreen-signup');

// when user *attempts* to sign in (picks a username)
startScreenSignup.onclick = () => {
    socket.emit('signup', {username: startScreenUsername.value});
}

// result for signup
socket.on('signupResponse', (data) => {
    if (data.success) { // proceed to chat if login successful
        startScreen.style.display = 'none';
        header.style.display = 'inline-block';
        lobby.style.display = 'inline-block';
    } else if (data.error === "missingRequiredField") {
        startScreenUsername.placeholder = "This field is required";
        startScreenUsername.style.color = "#ff0000";
    } else {
        let errorMsg = "Username taken.";
        alert(errorMsg);
        //startScreen.innerHTML += `<div class="error-message">${errorMsg}</div>`;
        //alert("Username taken.");
    }
});



/*
* Create or join chats
*/
const chatOptions = document.getElementById('chatOptions');
const createChatCode = document.getElementById('createChat-code');
const createChatConfirm = document.getElementById('createChat-confirm');

const joinChatCode = document.getElementById('joinChat-code');
const joinChatConfirm = document.getElementById('joinChat-confirm');

const chatInfo = document.getElementById('chatInfo');

// create a chat
createChatConfirm.onclick = () => {
socket.emit('createChat', {code: createChatCode.value});
}
socket.on('createChatResponse', (data) => {
    if (data.success) {
        lobby.style.display = 'none';
        chatScreen.style.display = 'inline-block';
    } else {
        alert("Chat name is taken. Try another one.");
    }
});


// join a chat
joinChatConfirm.onclick = () => { socket.emit('joinChat', {code: joinChatCode.value}); }
socket.on('joinChatResponse', (data) => {
    if (data.success) {
        lobby.style.display = 'none';
        chatScreen.style.display = 'inline-block';
    } else {
        alert("Chat name does not exist.");
    }
});

// leave a chat (return to lobby)
const returnToLobby = document.getElementById('returnToLobby');
const returnToLobbyConfirm = document.getElementById('returnToLobby-confirm');

returnToLobbyConfirm.onclick = () => { socket.emit('leaveChat'); }
socket.on('leaveChatResponse', () => {
    lobby.style.display = 'inline-block';
    chatScreen.style.display = 'none';
    chatText.innerHTML = ""; // clear innerHTML for chat
});
