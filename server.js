// main app

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const UserAccount = require('./server/UserAccount');
const Chat = require('./server/Chat');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000

// create node.js server
app.use('/client', express.static(__dirname + '/client'));

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/client/index.html');
});



io.on('connection', socket => {
    // signup (and proceed to lobby)
    socket.on('signup', (data) => {
        UserAccount.isUsernameTaken(data, (result, error) => { //get callback result
            if (result) { // if true (is UNsuccessful)
                socket.emit('signupResponse', {success: false, error: error});
            } else {
                UserAccount.addUser(socket, data, () => {
                    // when a new client connects
                    socket.emit('signupResponse', {success: true});
                    console.log(`--- USER CONNECTED: ${UserAccount.USER_LIST[socket.id]["username"]} (Socket ID: ${socket.id})`)
                });
            }
        });
    });




    // create a chat
    socket.on('createChat', (data) => {
        try {
            Chat.isChatCodeTaken(data, (result) => {
                if (result) { // if it fails 
                    socket.emit('createChatResponse', {success: false});
                } else {
                    socket.emit('createChatResponse', {success: true});
                    Chat.addChatCode(socket, data, () => {
                        Chat.addUserToChat(socket, data, () => {
                            // notify chat user has joined
                            let chatCode = UserAccount.USER_LIST[socket.id]["chat"]; // returns value of key
                            let chatUsers = Object.keys(Chat.CHAT_CODES[chatCode]);

                            for (let i in chatUsers) { // only pick out users from the chat from the general socket dict
                                UserAccount.USER_LIST[chatUsers[i]]["socket"].emit('addChatAlert', `<b>${UserAccount.USER_LIST[socket.id]["username"]}</b>  has joined the chat`);
                            }
                        });
                    });
                }
            });
        }
        catch (TypeError) {console.error();}
    });

    
    // join a chat
    socket.on('joinChat', (data) => {
        try {
        Chat.addUserToChat(socket, data, (result) => {
            if (! result) {
                socket.emit('joinChatResponse', {success: false}); // code is invalid
            } else {
                socket.emit('joinChatResponse', {success: true}); // added user to chat
                // notify chat user has joined
                let chatCode = UserAccount.USER_LIST[socket.id]["chat"];
                let chatUsers = Object.keys(Chat.CHAT_CODES[chatCode])

                for (let i in chatUsers) { // only pick out users from the chat from the general socket dict
                    UserAccount.USER_LIST[chatUsers[i]]["socket"].emit('addChatAlert', `<b>${UserAccount.USER_LIST[socket.id]["username"]}</b> has joined the chat`);
                }
                
            }
        });
        } catch (TypeError) {console.log(`--- ERROR CAUGHT:`); console.error();}
    });



    // leave a chat
    socket.on('leaveChat', () => {
        try {
            // delete user from chat list--- which will then return them to lobby
            let chatCode = UserAccount.USER_LIST[socket.id]["chat"];
            let chatUsers = Object.keys(Chat.CHAT_CODES[chatCode]);

            // delete Chat.CHAT_CODES[chatCode][socket.id]; // remove user from chat 
            UserAccount.USER_LIST[socket.id]["chat"] = null; // user is not in any chat (value is null)

            console.log("USERS: ", Object.keys(Chat.CHAT_CODES[chatCode]));

            for (let i in chatUsers) { // only pick out users from the chat from the general socket dict
                UserAccount.USER_LIST[chatUsers[i]]["socket"].emit('addChatAlert', `<b>${UserAccount.USER_LIST[socket.id]["username"]}</b> has left the chat`);
            }

            // If chat has 0 people, delete it
            if (chatUsers.length === 0) {
                delete Chat.CHAT_CODES[chatCode];
            }

            socket.emit('leaveChatResponse');
        }
        catch (TypeError) {
            console.log(`--- ERROR CAUGHT:`);
            console.error();
        }

    });



    // SEND MESSAGES TO CHAT
    socket.on('sendMsgToServer', (data) => {
        try {
            let playerName = UserAccount.USER_LIST[socket.id]["username"]; // gets name based on ID
            let chatCode = UserAccount.USER_LIST[socket.id]["chat"]; // get value (chat code)
            let currentPlayers = Object.keys(Chat.CHAT_CODES[chatCode]); // current players in chat session

            data = String(data).trim();
            if (data.length > 2000) {
                UserAccount.USER_LIST[socket.id]["socket"].emit('addChatAlert', `<b>Your message cannot exceed 2000 characters!</b>`);
            } else if (data !== "") {
                let re1 = new RegExp('<', 'g');
                data = data.replace(re1, "&lt;").replace(new RegExp('>', 'g'), "&gt;");
                // console.log(data)
                for (let i in currentPlayers) { // only send to contextual chat
                    UserAccount.USER_LIST[currentPlayers[i]]["socket"].emit('addChatMsg', {user: playerName, message: data});
                }
            }
        }
        catch (TypeError) {
            console.log(`--- ERROR CAUGHT:`);
            console.error();

        }

    });




    // If client disconnects (e.g. closes the tab, refreshes tab, etc.)
    socket.on('disconnect', () => {
        try {
            //console.log(socket.id)
            console.log(`--- USER DISCONNECTED: ${UserAccount.USER_LIST[socket.id]["username"]} (SOCKET ID: ${socket.id})`);
            // if user is in a chat but they close or reload tab
            // user has a name + they're in a chat
            let chatCode = UserAccount.USER_LIST[socket.id]["chat"]; // user's ID points to chat they're in
            if (UserAccount.USER_LIST[socket.id]["username"] !== undefined && chatCode !== null) {
                let chatUsers = Object.keys(Chat.CHAT_CODES[chatCode]);

                for (let i in chatUsers) {
                    if (chatUsers[i] === socket.id) {
                        delete Chat.CHAT_CODES[chatCode][socket.id]; // remove user from chat 
                        delete chatUsers[socket.id]; // from temp list

                        for (let i in chatUsers) { // notify chat player has left
                            UserAccount.USER_LIST[chatUsers[i]]["socket"].emit('addChatAlert', `<b>${UserAccount.USER_LIST[socket.id]["username"]} has left the chat</b>`);
                        }
                        break;
                    }
                }
            }

            delete UserAccount.USER_LIST[socket.id] // delete from list of users (which incl sockets)
        }
        catch (TypeError) { console.log(`--- USER DISCONNECTED: Username was undefined.`); }
        

        // if server is restarted and a user refreshes tab, their socket ID will remain
        // -- but data will be erased from server
        // since this is a temp server, it does not store any previous user data---
        
       
        // If chat has 0 people, delete it
        //if (chatUsers.length === 0) {
        //    delete Chat.CHAT_CODES[chatCode];
        //}
    });



    // remove sockets with no name from user list
    for (let i in UserAccount.USER_LIST) {
        if (i === undefined)
            delete UserAccount.USER_LIST[i];
    }

});


// Start server
server.listen(PORT, () => {
    console.log(`${'-'.repeat(100)}\nServer started on port ${PORT}\nConnected as of:  ${Date()}\n${'-'.repeat(100)}`);
});
