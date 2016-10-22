var io;
var gameSocket;
var loopIntervalID;
var isInitialized = false;
/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', BOUND, TRACK_LENGTH);
    numPlayers++;
    // Host Events
    //gameSocket.on('IAmReadyToPlay', hostReady);
    gameSocket.on('CoordinateData', updateDataToServer);
    gameSocket.on('disconnect', function(){
      numPlayers--;
    });

    if(!isInitialized){
      generateObstacleArray(OBSTACLE_SPACING);
      loopIntervalID = setInterval(gameloop, timeInterval);
      isInitialized = true;
    }
}

// function hostReady() {
//     console.log('A client is ready to play!');
// };


// Game Logic

//course variables
const BOUND = 500; //distance from center that counts as out of bounds
const TRACK_LENGTH = 10000;
const CAR_WIDTH = 50;
const CAR_HEIGHT = 75;
const OBSTACLE_SPACING = 1000;

//game states
const GAME_IN_PROGRESS = 1;
const GAME_OVER_WON = 2;
const GAME_OVER_LOST = 3;

//obstacle class def
var Obstacle = function(leftBound,size, yLocation) {
  this.leftBound = leftBound;
  this.rightBound = leftBound + size;
  this.yLocation = yLocation;
}

Obstacle.prototype.checkCollision = function() {
  if(xPos > this.leftBound - CAR_WIDTH && xPos < this.rightBound + CAR_WIDTH) {
    if(yPos > this.yLocation - CAR_HEIGHT && yPos < this.yLocation + 50 + CAR_HEIGHT){  //50 is obstacle height - can change later
      return true;
    }
  }
  return false;
}

var xPos = 0.0, yPos = 0.0, velocity = 0.0; // velocity = left/right speed

var velocityMultiplier = 0.05; //TODO: calibrate this by testing

var forwardSpeed = 1;
var numPlayers = 0;



var gameState = 1;

var timeInterval = 20;

var obstacleArray = [];

function gameloop() {
  if(false){//if(gameState != GAME_IN_PROGRESS) {
    clearInterval(loopIntervalID);
  } else {

  update(timeInterval);

  if(gameState == GAME_OVER_WON) {
    gameSocket.broadcast.emit('GameEnded', true);
  } else if(gameState == GAME_OVER_LOST) {
    gameSocket.broadcast.emit('GameEnded', false);
  }

  gameSocket.broadcast.emit('SendDataToClient', xPos, yPos, getRotationValue(), obstacleArray);

  console.log(numPlayers);
  }
}


function updateDataToServer(mouseX, windowWidth) {
//  console.log('Received X coordinate ' + mouseX + " from client!");
//  console.log('Current Velocity:' + velocity);
  var playerVelocityInput = (mouseX - windowWidth / 2.0) / windowWidth;
  playerVelocityInput = Math.max(-1, Math.min(playerVelocityInput, 1));
  playerVelocityInput *= velocityMultiplier;
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
  }

  for(i = 0; i < obstacleArray.length; i++) {
    if(obstacleArray[i].checkCollision()) {
      return true;
    }
  }

  return false;
}

function getRotationValue(){
  if(velocity == 0){
    return Math.PI/2;
  }
  return Math.atan(forwardSpeed/velocity);
}

function generateObstacleArray(spacing) {
  for(i = 0; i < TRACK_LENGTH; i += spacing){
    obstacleArray.push(new Obstacle(2 * (Math.random() - 0.5) * BOUND, Math.random() * BOUND, i));
  }
}
