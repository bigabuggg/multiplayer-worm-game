class PlayerHandler {

    constructor(SCENE_CONNECTION){

        this.scene = SCENE_CONNECTION;
        this.playersObj = {};
        this.playersList = [];
        
    }

    createPlayer(GIVEN_ID, givenX, givenY){

        const PLAYER_SPRITE_WIDTH = 40;
        const PLAYER_SPRITE_HEIGHT = 64;

        this.playersObj[GIVEN_ID] = this.scene.physics.add.sprite(givenX, givenY, "");
        this.playersObj[GIVEN_ID].body.setSize(PLAYER_SPRITE_WIDTH, PLAYER_SPRITE_HEIGHT);

        this.playersObj[GIVEN_ID].speedX = 300;
        this.playersObj[GIVEN_ID].speedY = 450;
        this.playersObj[GIVEN_ID].id = GIVEN_ID;
        this.playersObj[GIVEN_ID].stateX = "NONE";
        this.playersObj[GIVEN_ID].stateY = "NONE";

        this.playersObj[GIVEN_ID].body.setAllowGravity(true);
        this.playersObj[GIVEN_ID].body.setGravityY(700);

        this.playersObj[GIVEN_ID].collidersList = [];
        this.playersObj[GIVEN_ID].inputBuffer = [];
        this.playersObj[GIVEN_ID].maxInputTime = 200;

        this.playersList.push({
            x: this.playersObj[GIVEN_ID].x,
            y: this.playersObj[GIVEN_ID].y,
            velX: this.playersObj[GIVEN_ID].body.velocity.x,
            velY: this.playersObj[GIVEN_ID].body.velocity.y,
            stateX: this.playersObj[GIVEN_ID].stateX,
            stateY: this.playersObj[GIVEN_ID].stateY,
            id: GIVEN_ID,
            time: Date.now()
        })

        this.#setColliders(GIVEN_ID);

        console.log("player created")

    }

    destroyPlayer(GIVEN_ID){

        let {
            existsInPlayerObj,
            existsInPlayerList,
            indexInArr
        } = this.searchExistingPlayer(GIVEN_ID);

        if (existsInPlayerList)this.playersList.splice(indexInArr, 1)

        if (existsInPlayerObj){
            let playerCollidersList = this.playersObj[GIVEN_ID].collidersList
            for (let i = 0; i < playerCollidersList.length; i++){

                this.scene.physics.world.removeCollider(
                    playerCollidersList[i]
                )

            }
            this.playersObj[GIVEN_ID].destroy();
            delete this.playersObj[GIVEN_ID];
        }

        console.log("player destroyed")

    }

    searchExistingPlayer(GIVEN_ID){

        let index = this.playersList.findIndex(player => player.id === GIVEN_ID);
        return {

            existsInPlayerObj: !!this.playersObj[GIVEN_ID],
            existsInPlayerList: index !== -1,
            indexInArr: index

        }

    }

    #setColliders(GIVEN_ID){

        this.playersObj[GIVEN_ID].collidersList.push(
        this.scene.physics.add.collider(this.playersObj[GIVEN_ID], 
        this.scene.object))

        this.playersObj[GIVEN_ID].collidersList.push(
        this.scene.physics.add.collider(this.playersObj[GIVEN_ID], 
        this.scene.object2))

    }

    updatePlayer(GIVEN_ID){

        const searchResults = this.searchExistingPlayer(GIVEN_ID);

        const playerReference = this.playersObj[GIVEN_ID];

        if (!playerReference)return

        //x axis movement
        if (playerReference.stateX === "RIGHT"){
            playerReference.body.setVelocityX(playerReference.speedX)
        }

        else if (playerReference.stateX === "LEFT"){
            playerReference.body.setVelocityX(-playerReference.speedX)
        }

        else {
            playerReference.body.setVelocityX(0);
        }

        //y axis movement
        if (playerReference.body.onFloor() && (playerReference.stateY === "UP")){
            playerReference.body.setVelocityY(-playerReference.speedY);
        }

        if (playerReference.body.velocity.y < playerReference.speedY && playerReference.stateY === "DOWN"){
            playerReference.body.setVelocityY(playerReference.speedY)
        }

        //console.log(this.playersObj[GIVEN_ID].x, this.playersObj[GIVEN_ID].y)

        this.playersList[searchResults.indexInArr].x = playerReference.x;
        this.playersList[searchResults.indexInArr].y = playerReference.y;
        this.playersList[searchResults.indexInArr].stateX = playerReference.stateX;
        this.playersList[searchResults.indexInArr].stateY = playerReference.stateY;
        this.playersList[searchResults.indexInArr].velX = playerReference.body.velocity.x;
        this.playersList[searchResults.indexInArr].velY = playerReference.body.velocity.y;
        this.playersList[searchResults.indexInArr].time = Date.now();

        let currentInput = {
            stateX: playerReference.stateX,
            stateY: playerReference.stateY,
            velX: playerReference.body.velocity.x,
            velY: playerReference.body.velocity.y,
            time: Date.now()
        };

        playerReference.inputBuffer.push(currentInput);
        playerReference.inputBuffer = playerReference.inputBuffer.filter(input => input.time < playerReference.maxInputTime)

    }

    handleClientStateBuffer(GIVEN_ID, GIVEN_DATA, DELTATIME){

        const clientInputBuffer = GIVEN_DATA.inputBuffer;

        const serverPlayerReference = this.playersObj[GIVEN_ID];
        const serverInputBuffer = this.playersObj[GIVEN_ID];

        for (let i = 0; i < clientInputBuffer.length; i++){

            this.replayInput(GIVEN_ID, clientInputBuffer[i], DELTATIME)
        }
        this.scene.physics.world.step(DELTATIME/1000);

    }

    replayInput(GIVEN_ID, GIVEN_CLIENT_BUFFER, DELTATIME){

        const playerReference = this.playersObj[GIVEN_ID];

        if (GIVEN_CLIENT_BUFFER.stateX === "RIGHT")playerReference.body.setVelocityX(playerReference.speedX)
        if (GIVEN_CLIENT_BUFFER.stateX === "LEFT")playerReference.body.setVelocityX(-playerReference.speedX)
        if (GIVEN_CLIENT_BUFFER.stateX === "NONE")playerReference.body.setVelocityX(0)

        if (playerReference.body.onFloor() && (GIVEN_CLIENT_BUFFER.stateY === "UP"))
            playerReference.body.setVelocityY(-playerReference.speedY)
            console.log("jump")
        if (playerReference.body.velocity.y < playerReference.speedY && GIVEN_CLIENT_BUFFER.stateY === "DOWN")
            playerReference.body.setVelocityY(playerReference.speedY)
            console.log("down")

        playerReference.stateX = GIVEN_CLIENT_BUFFER.stateX;
        playerReference.stateY = GIVEN_CLIENT_BUFFER.stateY;

    }

}


module.exports = PlayerHandler;