var io;
var gameSocket;

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
    //gameSocket.on('IAmReadyToPlay', hostReady);
    gameSocket.on('CoordinateData', updateDataToServer);

    setInterval(gameloop, timeInterval);
}

// function hostReady() {
//     console.log('A client is ready to play!');
// };


// Game Logic

//course variables
const BOUND = 500; //distance from center that counts as out of bounds
const TRACK_LENGTH = 10000;

//game states
const GAME_IN_PROGRESS = 1;
const GAME_OVER_WON = 2;
const GAME_OVER_LOST = 3;

var xPos = 0.0, yPos = 0.0, velocity = 0.0; // velocity = left/right speed

var velocityMultiplier = 0.001; //TODO: calibrate this by testing

var forwardSpeed = 1;
var numPlayers = 1;
var gameState = 1;

var timeInterval = 100; //TODO: compute the correct interval

function gameloop() {
  update(timeInterval);
  if(gameState == GAME_OVER_WON) {
    gameSocket.emit('GameEnded', true);
  } else if(gameState == GAME_OVER_LOST) {
    gameSocket.emit('GameEnded', false);
  }

  gameSocket.emit('SendDataToClient', xPos, yPos, getRotationValue());

}


function updateDataToServer(mouseX, windowWidth) {
  //console.log('Received X coordinate ' + mouseX + " from client!");
  var playerVelocityInput = (mouseX - windowWidth / 2) * velocityMultiplier;
  updateVelocity(playerVelocityInput);
  //gameSocket.emit('IHaveReceivedYourCoordinates');
};

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
  if(yPos > TRACK_LENGTH){
    gameState = GAME_OVER_WON;
  } else if(collisionOccurred){
    gameState = GAME_OVER_LOST;
  }
}

function checkCollisions(){
  if(Math.abs(xPos) > BOUND){
    return true;
  } //TODO: check obstacle collisions
}

function getRotationValue(){
  return Math.atan(forwardSpeed/velocity);
}
