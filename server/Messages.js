// format and send messages

const Chat = require('./server/Chat');
const UserAccount = require('./UserAccount');


function formatMessage() {

}

function sendMessage(data, socket) {
    let username = UserAccount.USER_LIST[socket.id]["username"]; // gets name based on ID
    let chatCode = UserAccount.USER_LIST[socket.id]["chat"]; // get value (chat code)
    let currentPlayers = Object.keys(Chat.CHAT_CODES[chatCode]); // current users in chat session

    data = String(data).trim();
    if (data.length > 2000) {
        UserAccount.USER_LIST[socket.id]["socket"].emit('addChatAlert', `<b>Your message cannot exceed 2000 characters!</b>`);
    } else if (data !== "") {
        let re1 = new RegExp('<', 'g');
        data = data.replace(re1, "&lt;").replace(new RegExp('>', 'g'), "&gt;");
        // console.log(data)
        for (let i in currentPlayers) { // only send to contextual chat
            UserAccount.USER_LIST[currentPlayers[i]]["socket"].emit('addChatMsg', {user: username, message: data});
        }
    }
}


module.exports.formatMessage = formatMessage;
module.exports.sendMessage = sendMessage;
