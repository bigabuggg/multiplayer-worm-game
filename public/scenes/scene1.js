let before;
class Scene1 extends Phaser.Scene{

    constructor(){
        super("scene1");
    }


    preload() {

        this.load.image("player_sprite", "../player/worm_sprite_40x64.png");
        this.load.spritesheet("player_walking_animation_sprite", '../player/worm_walk_animation.png', {

            frameWidth: 40,
            frameHeight: 64,

        });

    }

    create() {

        this.playerHandler = new PlayerHandler(this)
        
        this.object = this.physics.add.sprite(0,100, "");
        this.object.setScale(10, 5);
        this.object.body.setImmovable(true);

        this.object2 = this.physics.add.sprite(500,100, "");
        this.object2.setScale(10, 5);
        this.object2.body.setImmovable(true);

        this.TICK_RATE = 30;
        this.TICK_RATE_DELTA = 0;

        console.log("game created");
        
    }

    update(time, deltaTime) {
        for (let id in this.playerHandler.playersObj){

            this.playerHandler.playersObj[id].updateFunction(this)

        }
        this.#tickRateHandler(deltaTime)
    }

    clientDataHandler(webSocket, data){

        if (data.type === "create-all-players"){
            this.#createAllPlayers(data.payload.allPlayers);
        }

        else if (data.type === "create-new-player"){

            this.playerHandler.createPlayer(
                data.payload.id, 
                data.payload.x, 
                data.payload.y
            )

        }

        else if (data.type === "other-player-disconnected"){

            this.playerHandler.destroyPlayer(data.payload.id)

        }


        else if (data.type === "update-all-players"){

            this.#recieveServerAuthorization(data)

        }

    }

    #createAllPlayers(givenPlayersList){

        for (let i = 0; i < givenPlayersList.length; i++){
            this.playerHandler.createPlayer(
                givenPlayersList[i].id, 
                givenPlayersList[i].x, 
                givenPlayersList[i].y
            )
        }

    }

    #tickRateHandler(deltaTime){

        this.TICK_RATE_DELTA += deltaTime;
        const playerReference = this.playerHandler.playersObj[ws.id];
        if (playerReference && (this.TICK_RATE_DELTA >= this.TICK_RATE)){
            this.TICK_RATE_DELTA = 0;
            ws.send(JSON.stringify({

                type: "update-client-state",
                payload:{

                    stateX: playerReference.stateX,
                    stateY: playerReference.stateY,
                    inputBuffer: playerReference.inputBuffer

                }
                
            }))

        }

    }

    #recieveServerAuthorization(GIVEN_DATA){
        const givenPlayersListReference = GIVEN_DATA.payload.playersList;
        const playersListReference = this.playerHandler.playersList;
        const playersObjReference = this.playerHandler.playersObj;
        for (let i = 0; i < givenPlayersListReference.length; i++){

            const givenPlayer = givenPlayersListReference[i];

            if (givenPlayer.id === ws.id){
                playersObjReference[ws.id].clientToServerHandler(this, givenPlayer);
            }

            else{
                if (!playersObjReference[givenPlayer.id]) continue
                //console.log(givenPlayer.id)
                playersObjReference[givenPlayer.id].updateFunction(this, givenPlayer)
            }

        }

    }

}