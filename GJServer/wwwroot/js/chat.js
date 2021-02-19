"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
window.connection = connection;
//Disable send button until connection is established
document.getElementById("sendButton").disabled = true;
var numPlayers = 0;
window.ships = {};
connection.on("ReceiveMessage", function (user, message) {
    if (!window.ships[user]) {
        var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var encodedMsg = user + " joins the game! " + msg;
        numPlayers++;
        //var encodedMsg = "A new player joined the game!"
        var li = document.createElement("li");
        li.textContent = encodedMsg;
        document.getElementById("messagesList").appendChild(li);
        document.getElementById("numPlayers").innerHTML = numPlayers;
    }

    window.ships[user] = JSON.parse(message);
});

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    while (user == "") {
        let randomName = Math.random() * 10;
        if (!window.ships[randomName]) {
            user = randomName;
        }
    }
    document.getElementById("userInput").value = user;
    var message = document.getElementById("messageInput").value;
    connection.invoke("SendMessage", user, message).catch(function (err) {
        return console.error(err.toString());
    });

    event.preventDefault();
});
