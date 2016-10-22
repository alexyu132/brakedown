/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });

    // Host Events
    //gameSocket.on('hostCreateNewGame', hostCreateNewGame);

}


// Game Logic
var xPos, yPos, velocity;

var speed = 1;

var numPlayers = 0.0;

function update(deltaTime){
  //update position
  //check for collisions and update game state as necessary
}

function updatePosition(deltaTime){
  xPos += velocity*deltaTime;
  yPos += deltaTime*speed;
}

function updateVelocity(newVelocity){ //adds a player's wheel setting to overall
  velocity += newVelocity/numPlayers;
  
}
