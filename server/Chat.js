// manage different chats

const UserAccount = require('./UserAccount');


let CHAT_CODES = {}; // contains chat codes which in turn contain list of users 
/*
>>> Layout:

CHAT_CODES = {
    "code": [user, user, user],
    "code": [user, user]
}

*/


function isChatCodeTaken(data, callback) {
    setTimeout( () => {
        let codeExists = false; // will stay false if no existing user is found
        let code = String(data.code).trim(); // convert to str, strip whitespace
        
        if (code === "") { // if username is blank
            codeExists = true;
        }

        let chatCodes = Object.keys(CHAT_CODES)
        for (let i in chatCodes) {
            if (code === String(chatCodes[i])) {
                codeExists = true;
                break;
            }
        }

        callback(codeExists); // figure out way to make this case insensitive
    }, 10);
}


function addUserToChat(socket, data, callback) {
    setTimeout( () => {
        let codeExists = false;
        
        for (let chat in CHAT_CODES) {
            if (String(data.code) === chat) {
                codeExists = true;
                //CHAT_CODES[chat].push(socket.id); 
                CHAT_CODES[chat][String(socket.id)] = {}; // add user to the chat (chat code: {})
                
                UserAccount.USER_LIST[socket.id]["chat"] = String(data.code);


                let currentUsers = String(Object.values(CHAT_CODES[chat]))
                console.log(`CURRENT USERS IN ${chat}: ${currentUsers}`);
                console.log(`${socket.id} --- Name: ${UserAccount.USER_LIST[socket.id]["username"]} --- Chat code: ${UserAccount.USER_LIST[socket.id]["chat"]}\n`);

                break;
            }
        }

        callback(codeExists) // if false: fail, if true: success
    }, 10);
}

function addChatCode(socket, data, callback) {
    setTimeout( () => {
        CHAT_CODES[String(data.code)] = {}; // "code": {}

        // addUserToChat(socket, data, callback);
        
        callback() // no return statement, hence callback is void
    }, 10);
}


module.exports.CHAT_CODES = CHAT_CODES;
module.exports.isChatCodeTaken = isChatCodeTaken;
module.exports.addChatCode = addChatCode;

module.exports.addUserToChat = addUserToChat;
