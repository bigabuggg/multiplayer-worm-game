
const Phaser = require("phaser");
const PlayerHandler = require("../player/player.js");

class Scene1 extends Phaser.Scene{

    constructor(){
        super("scene1");
    }


    preload() {

    }

    create() {

        this.playerHandler = new PlayerHandler(this);
        
        this.object = this.physics.add.sprite(0,100, "");
        this.object.setScale(10, 5);
        this.object.body.setImmovable(true);

        this.object2 = this.physics.add.sprite(500,100, "");
        this.object2.setScale(10, 5);
        this.object2.body.setImmovable(true);

        this.globalDeltaTime = 0;

        console.log("game created");
        
    }

    update(time, deltaTime) {

        this.globalDeltaTime = deltaTime;

        for (let id in this.playerHandler.playersObj){

            this.playerHandler.updatePlayer(id, deltaTime);

        }
    }

    clientDataHandler(webSocket, data){

        const playerReference = this.playerHandler.playersObj[webSocket.id];

        if (data.type === "update-client-state"){

            this.playerHandler.handleClientStateBuffer(webSocket.id, data.payload, this.globalDeltaTime)

        }

    }

}


module.exports = Scene1;