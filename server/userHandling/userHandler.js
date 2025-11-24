

class UserHandler {

    constructor(){

        this.activeUsersObj = {};
        this.activeUsersList = [];

    }

    addUserToDatabase (webSocket){

        let ID = this.#create_socketID();
        this.#create_user(ID);
        webSocket.id = ID;
        let userReference = this.activeUsersObj[ID];
        this.activeUsersList.push(userReference);

    }

    removeUserFromDatabase(webSocket){

        const {existsInObj, existsInArr, indexInArr} = 
        this.#searchExistingUser(webSocket);

        if (existsInObj) delete this.activeUsersObj[webSocket.id];
        if (existsInArr) this.activeUsersList.splice(indexInArr, 1)

    }

    #searchExistingUser(webSocket){

        const index = this.activeUsersList.findIndex(user => user.id === webSocket.id);
        return {
            existsInObj: !!this.activeUsersObj[webSocket.id],
            existsInArr: index !== -1,
            indexInArr: index
        };

    }

    #create_user(GIVEN_ID){

        this.activeUsersObj[GIVEN_ID] = {
                x: 0,
                y: -150,
                id: GIVEN_ID
        };

    }

    #create_socketID(){

        const CHARACTERS = [
        "A", "B", "C", "D", "E", "F", "G", "H", "I",
        "J", "K", "L", "M", "N", "O", "P", "Q", "R",
        "S", "T", "U", "V", "W", "X", "Y", "Z", "1",
        "2", "3", "4", "5", "6", "7", "8", "9", "0"
        ];

        let GENERATED_ID;
        const ID_CHARACTER_LIMIT = 10;

        do{

            GENERATED_ID = "";

            for (let i = 0; i < ID_CHARACTER_LIMIT; i++){

                let chosenCharacter = Math.floor(Math.random()*CHARACTERS.length);
                GENERATED_ID += CHARACTERS[chosenCharacter];

            }

        } while(this.activeUsersObj[GENERATED_ID])

        return GENERATED_ID;

    }

};

module.exports = UserHandler;

