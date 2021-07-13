// temp user list - stores users for duration of session
// "socket ID": "username"
let USER_LIST = {};

function isUsernameTaken(data, callback) {
    setTimeout( () => {
        let userExists = false; // will stay false if no existing user is found
        let error = "";
        
        // gather usernames into array
        let values = []
        for (let i in USER_LIST) {
            values.push(USER_LIST[i]["username"]);
        }

        let name = String(data.username).trim(); // convert to string, strip whitespace
        if (name === "") { // if username is blank
            userExists = true;
            error = "missingRequiredField";
        }

        for (let i in values) {
            console.log(values[i]);

            if (name.toLowerCase() === String(values[i]).toLowerCase()) {
                userExists = true;
                break;
            }
        }

        callback(userExists, error); // figure out way to make this case insensitive
    }, 10);
}

function addUser(socket, data, callback) {
    setTimeout( () => {
        USER_LIST[String(socket.id)] = {};
        USER_LIST[String(socket.id)]["username"] = data.username;
        USER_LIST[String(socket.id)]["chat"] = null;
        USER_LIST[String(socket.id)]["socket"] = socket; // add socket data

        callback() // no return statement, hence callback is void
    }, 10);

}

module.exports.USER_LIST = USER_LIST;
module.exports.isUsernameTaken = isUsernameTaken;
module.exports.addUser = addUser;
