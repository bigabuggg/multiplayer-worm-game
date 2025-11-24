
class PlayerHandler {

    constructor(SCENE_CONNECTION){

        this.scene = SCENE_CONNECTION;
        this.playersObj = {};
        this.playersList = [];
        
    }

    createPlayer(GIVEN_ID, givenX, givenY){

        this.playersObj[GIVEN_ID] = this.scene.physics.add.sprite(givenX, givenY, "player_sprite");

        this.playersObj[GIVEN_ID].speedX = 300;
        this.playersObj[GIVEN_ID].speedY = 450;

        this.playersObj[GIVEN_ID].id = GIVEN_ID;
        this.playersObj[GIVEN_ID].isSelf = (GIVEN_ID === ws.id);
        this.playersObj[GIVEN_ID].stateX = "NONE";
        this.playersObj[GIVEN_ID].stateY = "NONE";
        this.playersObj[GIVEN_ID].serverPosSnapshot = undefined;

        if (this.playersObj[GIVEN_ID].isSelf) {

            this.create_camera();
            this.playersObj[GIVEN_ID].updateFunction = updateClientPlayer;
            this.playersObj[GIVEN_ID].clientToServerHandler = clientToServerHandler;
            this.playersObj[GIVEN_ID].inputBuffer = [];
            this.playersObj[GIVEN_ID].lastInput;
            
        }
        else this.playersObj[GIVEN_ID].updateFunction = updateOtherPlayer;

        this.playersObj[GIVEN_ID].body.setAllowGravity(true);
        this.playersObj[GIVEN_ID].body.setGravityY(700);

        this.playersObj[GIVEN_ID].collidersList = [];

        this.playersList.push({
            x: this.playersObj[GIVEN_ID].x,
            y: this.playersObj[GIVEN_ID].y,
            id: GIVEN_ID
        })

        this.#setColliders(GIVEN_ID);

        this.scene.anims.create({
            key: "player_walking_animation",
            frames: this.scene.anims.generateFrameNumbers("player_walking_animation_sprite"),
            frameWidth: 40,
            frameHeight: 64,
            frameRate: 34,
            repeat: -1,
        })

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

    create_camera(){

        if (!this.playersObj[ws.id]) return;
        this.scene.cameras.main.startFollow(this.playersObj[ws.id]);
        this.scene.cameras.main.setLerp(0.031);
    
    }

}

function updateOtherPlayer(SCENE_CONNECTION, serverPlayer){

    if (!serverPlayer)return

    const playerReference = SCENE_CONNECTION.playerHandler.playersObj[serverPlayer.id];

    if (!playerReference)return

    playerReference.x = serverPlayer.x;
    playerReference.y = serverPlayer.y;
    playerReference.stateX = serverPlayer.stateX;
    playerReference.stateY = serverPlayer.stateY;
    console.log(playerReference.stateX)

    //x axis movement
    if (playerReference.stateX === "RIGHT"){
        playerReference.setFlipX(false);
        if (playerReference.body.onFloor())playerReference.play("player_walking_animation", true);
        else {playerReference.stop(); playerReference.setTexture("player_sprite")}
    }

    else if (playerReference.stateX === "LEFT"){
        playerReference.setFlipX(true);
        if (playerReference.body.onFloor())playerReference.play("player_walking_animation", true);
        else {playerReference.stop(); playerReference.setTexture("player_sprite")}
    }

    else{
        playerReference.stop(); 
        playerReference.setTexture("player_sprite")
        playerReference.stateX = "NONE"
    }

    if (playerReference.serverPosSnapshot) {
        const SNAP_INTERVAL = 100;
        let t = Phaser.Math.Clamp((Date.now() - playerReference.serverPosSnapshot.time) / SNAP_INTERVAL, 0, 1);

        playerReference.x = Phaser.Math.Linear(playerReference.x, playerReference.serverPosSnapshot.x, t);
        playerReference.y = Phaser.Math.Linear(playerReference.y, playerReference.serverPosSnapshot.y, t);
    }

}

function updateClientPlayer(SCENE_CONNECTION){

    const playerReference = SCENE_CONNECTION.playerHandler.playersObj[ws.id]

    if (!playerReference)return

    //x axis movement
    if (right_pressed || right_arrow_pressed){
        playerReference.body.setVelocityX(playerReference.speedX);
        playerReference.setFlipX(false);
        if (playerReference.body.onFloor())playerReference.play("player_walking_animation", true);
        else {playerReference.stop(); playerReference.setTexture("player_sprite")}
        playerReference.stateX = "RIGHT";

    }

    else if (left_pressed || left_arrow_pressed){
        playerReference.body.setVelocityX(-playerReference.speedX);
        playerReference.setFlipX(true);
        if (playerReference.body.onFloor())playerReference.play("player_walking_animation", true)
        else {playerReference.stop(); playerReference.setTexture("player_sprite")}
        playerReference.stateX = "LEFT";
    }

    else {
        playerReference.body.setVelocityX(0);
        playerReference.play("player_walking_animation", false)
        playerReference.setTexture("player_sprite")
        playerReference.stateX = "NONE";
    }

    //y axis movement
    let YKeysPressed = false;
    if (playerReference.body.onFloor() && (up_pressed || up_arrow_pressed)){
        playerReference.body.setVelocityY(-playerReference.speedY);
        playerReference.stateY = "UP";
        YKeysPressed = true;
    }

    if ((playerReference.body.velocity.y < playerReference.speedY) && (down_pressed || down_arrow_pressed)){
        playerReference.body.setVelocityY(playerReference.speedY)
        playerReference.stateY = "DOWN";
        YKeysPressed = true;
    }

    if (!YKeysPressed){
        playerReference.stateY = "NONE"
    }

    let currentInput = {
        stateX: playerReference.stateX, 
        stateY: playerReference.stateY,
        velX: playerReference.body.velocity.x,
        velY: playerReference.body.velocity.y,
        time: Date.now()
    };
    handleInputBuffer(SCENE_CONNECTION, playerReference, currentInput, playerReference.lastInput);
    playerReference.lastInput = currentInput;

    if (playerReference.serverPosSnapshot) {

        const distanctFromServerPlayer = Phaser.Math.Distance.Between(
            playerReference.x, 
            playerReference.y, 
            playerReference.serverPosSnapshot.x, 
            playerReference.serverPosSnapshot.y
        );

        if (distanctFromServerPlayer < 5)return;

        const SNAP_INTERVAL = 70;
        let t = Phaser.Math.Clamp((Date.now() - playerReference.serverPosSnapshot.time) / SNAP_INTERVAL, 0, 1);

        playerReference.x = Phaser.Math.Linear(playerReference.x, playerReference.serverPosSnapshot.x, t);
        playerReference.y = Phaser.Math.Linear(playerReference.y, playerReference.serverPosSnapshot.y, t);

    }


}

function clientToServerHandler(SCENE_CONNECTION, serverPlayer){

    const playersObjReference = SCENE_CONNECTION.playerHandler.playersObj;
    const playersListReference = SCENE_CONNECTION.playerHandler.playersList
    const playerReference = playersObjReference[ws.id];

    playerReference.serverPosSnapshot = serverPlayer
}

function handleInputBuffer(SCENE_CONNECTION, playerReference, currentInput, lastInput){

    const MAX_BUFFER_TIME = 200;
    if (!lastInput) return;

    playerReference.inputBuffer.push(currentInput);
    playerReference.inputBuffer = playerReference.inputBuffer.filter(
        input => ((Date.now() - input.time) < MAX_BUFFER_TIME)
    )
    //console.log(playerReference.inputBuffer.length)

}

function lerpPosition(posA, posB, t) {
    return {
        x: lerp(posA.x, posB.x, t),
        y: lerp(posA.y, posB.y, t)
    };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}