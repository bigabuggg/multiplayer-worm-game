const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${protocol}/${window.location.host}`);


const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 1000,
    height: 500,
    scene: [Scene1],
    backgroundColor: '#51CFC9',


    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            fps: 2000,
            overlapBias: 8,
        }
    },

    scale: {
      zoom: 2,
      mode: Phaser.Scale.ScaleModes.FIT,
      autoCenter: Phaser.Scale.Center.CENTER_BOTH,
    }
};

const game = new Phaser.Game(config);


ws.addEventListener("message", async (event)=>{

  const data = JSON.parse(event.data);

  if (data.type === "assign-client-id"){ ws.id = data.payload.id; return; }

  const ACTIVE_SCENE = game.scene.getScenes(true)[0];
  let PROPER_SCENE_REFERENCE;
  let SCENE_KEY;
  if (!ACTIVE_SCENE) {
    // still not ready, queue
    checkForSceneStatus(data)
    console.log("scene not ready")
    return;
  }
  SCENE_KEY = ACTIVE_SCENE.sys.settings.key;
  PROPER_SCENE_REFERENCE = game.scene.getScene(SCENE_KEY);
  //console.log(`Scene key: ${SCENE_KEY}`);
  PROPER_SCENE_REFERENCE.clientDataHandler(ws, data)

})

async function checkForSceneStatus(GIVEN_DATA){


  let PROMISE_TIMEOUT = 1000;
  let create_all_players = (GIVEN_DATA.type === "create-all-players");
  let create_new_player = (GIVEN_DATA.type === "create-new-player");
  let delete_player = (GIVEN_DATA.type === "delete-player")
  
  let ACTIVE_SCENE = game.scene.getScenes(true)[0];

  if (ACTIVE_SCENE && (create_new_player||create_all_players||delete_player))return true

  else if (!ACTIVE_SCENE && (create_new_player||create_all_players||delete_player)){

    new Promise((resolve) =>{

      const check = ()=>{

        ACTIVE_SCENE = game.scene.getScenes(true)[0];

        if(ACTIVE_SCENE){ 
          let SCENE_KEY = ACTIVE_SCENE.sys.settings.key;
          let PROPER_SCENE_REFERENCE = game.scene.getScene(SCENE_KEY);
          PROPER_SCENE_REFERENCE.clientDataHandler(ws, GIVEN_DATA);
          resolve();
        }
        else  setTimeout(check, PROMISE_TIMEOUT)
      }

      check()

    })

  }

  //only listens for messages that are important, like creating a new player or all players.
  //other messages are ignored to avoid too many promises piling up

}
