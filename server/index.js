
//server setup----------
const express = require("express");
const { WebSocketServer } = require("ws")

//new express instance
const app = express();

//enables use of public files
app.use(express.static("../public"));

//creating http server
const server = require("http").Server(app);

//attaches http server websocket
const wsServer = new WebSocketServer({server});

const PORT = 3000;  
initiateServer(PORT);


//game setup----------
require('@geckos.io/phaser-on-nodejs');

const Phaser = require('phaser');

//my own modules----------
const UserHandler = require("./userHandling/userHandler.js");

//scenes-----
const Scene1 = require("./scenes/scene1.js");
const { send } = require("process");

const config = {
    type: Phaser.HEADLESS, // allows server to run without canvas
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },
    scene: [Scene1],
};

const game = new Phaser.Game(config);


//global-----
const userHandler = new UserHandler();
const TICK_RATE = 30;

//server communications----------

wsServer.on("connection", (webSocket)=>{

    userHandler.addUserToDatabase(webSocket);
    console.log("A user has connected");

    webSocket.send(JSON.stringify({
        type: "assign-client-id",
        payload: {id: webSocket.id}
    }))

    //scene references
    const CURRENT_SCENE = game.scene.getScenes(true)[0]; //returns all active scenes. [SCENE], so index always 0

    if (!CURRENT_SCENE) return;

    CURRENT_SCENE.playerHandler.createPlayer(
        webSocket.id,
        userHandler.activeUsersObj[webSocket.id].x,
        userHandler.activeUsersObj[webSocket.id].y
    )

    let createdPlayerX = CURRENT_SCENE.playerHandler.playersObj[webSocket.id].x;
    let createdPlayerY = CURRENT_SCENE.playerHandler.playersObj[webSocket.id].y;

    const playersList = CURRENT_SCENE.playerHandler.playersList;

    webSocket.send(JSON.stringify({
        type: "create-all-players",
        payload:{
            allPlayers: playersList,
        }
    }))

    let NEW_PLAYER_DATA = {
        type: "create-new-player",
        payload:{

            x: createdPlayerX,
            y: createdPlayerY,
            id: webSocket.id,

        }
    }

    sendToAllClients(webSocket, NEW_PLAYER_DATA, true);

    webSocket.on("message", (rawData)=>{

        const data = JSON.parse(rawData);

        CURRENT_SCENE.clientDataHandler(webSocket, data)

    })

    //disconnect handling
    webSocket.on("close", ()=>{

        CURRENT_SCENE.playerHandler.destroyPlayer(webSocket.id);
        userHandler.removeUserFromDatabase(webSocket);

        sendToAllClients(
            webSocket, 
            {
                type: "other-player-disconnected",
                payload: {id: webSocket.id}
            },
            true
        )

        console.log("A user has disconnected");
        console.log(userHandler.activeUsersObj);

    });

});

function updateAllClients(){

    setInterval(function(){

        const CURRENT_SCENE = game.scene.getScenes(true)[0];
        const playersListReference = CURRENT_SCENE.playerHandler.playersList;
        if (!CURRENT_SCENE || !playersListReference) return
        sendToAllClients(
            null,
            {
                type: "update-all-players",
                payload: {playersList: playersListReference}
            },
            true
        )

    }, TICK_RATE)

}

function sendToAllClients(webSocket, DATA_TO_SEND, EXCLUDING_SELF){

    wsServer.clients.forEach(client=>{

        let isSelf = (webSocket) ? (client.id === webSocket.id):false;
        if (isSelf && EXCLUDING_SELF) return
        else client.send(JSON.stringify(DATA_TO_SEND))

    })

}

function initiateServer(GIVEN_PORT){

    if (!server.listening){

        //initiates the server with the port and the IP 0.0.0.0
        server.listen(GIVEN_PORT, "0.0.0.0", () => {

            console.log(`Server has been initiated at http://localhost:${GIVEN_PORT}`);

        })

    }

    else console.log("Server has already been initiated")

}

updateAllClients()