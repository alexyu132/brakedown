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
    gameSocket.on('IAmReadyToPlay', hostReady);
    gameSocket.on('CoordinateData', receivedCoordinates);

}

function hostReady() {
    console.log('A client is ready to play!');
};

function receivedCoordinates(mouseX) {
    console.log('Received X coordinate '+mouseX+" from client!");
    gameSocket.emit('IHaveReceivedYourCoordinates');
};

// Game Logic

//course variables
const BOUND = 500; //distance from center that counts as out of bounds
const TRACK_LENGTH = 10000;

//game states
const GAME_IN_PROGRESS = 1;
const GAME_OVER_WON = 2;
const GAME_OVER_LOST = 3;

var xPos=0.0, yPos=0.0, velocity=0.0; // velocity = left/right speed

var forwardSpeed = 1;

var numPlayers = 0;

var gameState = 1;


function update(deltaTime){
  updatePosition(deltaTime);
  updateGameStatus(checkCollisions());
}

function updatePosition(deltaTime){
  xPos += velocity * deltaTime;
  yPos += deltaTime * forwardSpeed;
}

function updateVelocity(newVelocity){ //Adds a player's wheel setting to a moving average, asynchronous
  velocity -= velocity / numPlayers;  //Call this once per update interval for each user
  velocity += newVelocity / numPlayers;
}

function updateGameStatus(collisionOccurred){
  if(yPos > track_length){
    gameState = GAME_OVER_WON;
  } else if(collisionOccurred){
    gameState = GAME_OVER_LOST;
  }
}

function checkCollisions(){
  if(Math.abs(xPos) > BOUND){
    return true;
  }
}

function updateVelocity(newVelocity){ //adds a player's wheel setting to overall
  velocity += newVelocity / numPlayers;

}
