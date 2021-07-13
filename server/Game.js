// manage different chats

const UserAccount = require('../server/UserAccount');


let CHAT_CODES = {}; // contains chat codes which in turn contain list of users 
/*
>>> Layout:

CHAT_CODES = {
    "code": [user, user, user],
    "code": [user, user]
}

*/


function isGameCodeTaken(data, callback) {
    setTimeout( () => {
        let codeExists = false; // will stay false if no existing user is found
        let code = String(data.code).trim(); // convert to str, strip whitespace
        
        if (code === "") { // if username is blank
            codeExists = true;
        }

        let gameCodes = Object.keys(CHAT_CODES)
        for (let i in gameCodes) {
            if (code === String(gameCodes[i])) {
                codeExists = true;
                break;
            }
        }

        callback(codeExists); // figure out way to make this case insensitive
    }, 10);
}


function addUserToGame(socket, data, callback) {
    setTimeout( () => {
        let codeExists = false;
        
        for (let game in CHAT_CODES) {
            if (String(data.code) === game) {
                codeExists = true;
                //CHAT_CODES[game].push(socket.id); 
                CHAT_CODES[game][String(socket.id)] = {}; // add user to the game (game code: {})
                
                UserAccount.USER_LIST[socket.id]["chat"] = String(data.code);


                let currentUsers = String(Object.values(CHAT_CODES[game]))
                console.log(`CURRENT USERS IN ${game}: ${currentUsers}`);
                console.log(`${socket.id} --- Name: ${UserAccount.USER_LIST[socket.id]["username"]} --- Game code: ${UserAccount.USER_LIST[socket.id]["chat"]}\n`);

                break;
            }
        }

        callback(codeExists) // if false: fail, if true: success
    }, 10);
}

function addGameCode(socket, data, callback) {
    setTimeout( () => {
        CHAT_CODES[String(data.code)] = {}; // "code": {}

        // addUserToGame(socket, data, callback);
        
        callback() // no return statement, hence callback is void
    }, 10);
}


module.exports.CHAT_CODES = CHAT_CODES;
module.exports.isGameCodeTaken = isGameCodeTaken;
module.exports.addGameCode = addGameCode;

module.exports.addUserToGame = addUserToGame;
