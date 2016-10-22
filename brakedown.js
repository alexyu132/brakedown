var io;
var gameSocket;
var loopIntervalID;
/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket) {
  io = sio;
  gameSocket = socket;
  gameSocket.emit('connected', {
    message: "You are connected!"
  });

  // Host Events
  //gameSocket.on('IAmReadyToPlay', hostReady);
  gameSocket.on('CoordinateData', updateDataToServer);

  loopIntervalID = setInterval(gameloop, timeInterval);
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

var xPos = 0.0,
  yPos = 0.0,
  velocity = 0.0; // velocity = left/right speed

var velocityMultiplier = 0.01; //TODO: calibrate this by testing

var forwardSpeed = 1;
var numPlayers = 1;
var gameState = 1;

var timeInterval = 100;

function gameloop() {
  if (gameState != GAME_IN_PROGRESS) {
    clearInterval(loopIntervalID);
  }

  update(timeInterval);
  if (gameState == GAME_OVER_WON) {
    gameSocket.emit('GameEnded', true);
  } else if (gameState == GAME_OVER_LOST) {
    gameSocket.emit('GameEnded', false);
  }

  gameSocket.emit('SendDataToClient', xPos, yPos, getRotationValue());
  GG.animate(xCoor, yCoor);
  //}, 100);
  setTimeout('', 100);
}
var GG = {
  var ctx: null;
  canvasApp: function() {
      IO.canvas = document.getElementById("myCanvas");
      var ctx = IO.canvas.getContext("2d");
      IO.drawRoad();
      IO.drawCar();
      //alert("ok");
      var randStartX = Math.random() * (IO.canvas.width - 100) + 50;
      GG.drawObstacle(ctx, randStartX, 0);
      //alert("here?");
      //setTimeout(function() {
      //var startTime = (new Date()).getTime();
      //  IO.animate(ctx, randStartX, 0, startTime);
      //}, 1000);
      //alert("doggy");
      //IO.gameLoop(ctx, randStartX, 0);
      GG.animate(xCoor, yCoor);
    },
    //gameLoop: function(ctx, xCoor, yCoor) {

    //setTimeout(function() {
    //alert("in timeout");
    //var startTime = (new Date()).getTime();
    //yCoor += 5;
    //IO.animate(ctx, xCoor, yCoor);
    //}, 100);
    //setTimeout('', 100);
    //},

    drawCar: function() {
      var car = IO.canvas.getContext("2d");
      car.fillStyle = "#FF0000";
      car.beginPath();
      car.moveTo(IO.canvas.width / 2 - 20, IO.canvas.height - 20);
      car.lineTo(IO.canvas.width / 2 + 20, IO.canvas.height - 20);
      car.lineTo(IO.canvas.width / 2, IO.canvas.height - 60);
      car.lineTo(IO.canvas.width / 2 - 20, IO.canvas.height - 20);
      //car.moveTo(xPos,canvas.height);
      //car.lineTo(xPos+20,canvas.height-20);
      //car.lineTo(xPos,canvas.height-60);
      //car.lineTo(xPos-20,canvas.height-20);

      car.closePath();
      car.fill();
      car.stroke();
    },

    drawRoad: function() {
      //IO.bindEvents();
      //IO.socket.on('SendDataToClient', IO.updateDataToClient);
      //alert("drawing rode");
      console.log('PositionX: ' + IO.xPos);
      console.log('PositionY: ' + IO.yPos);
      var changeInX = -(IO.xPos - IO.canvas.width / 2);
      //if (changeInX.isNaN()) {
      //  changeInX = 0;
      //}
      //alert("HI");
      var grass = IO.canvas.getContext("2d");
      grass.fillStyle = "#66cc00";
      grass.fillRect(0, 0, IO.canvas.width, IO.canvas.height);

      var road = IO.canvas.getContext("2d");
      road.fillStyle = "#F8A757";
      road.beginPath();
      road.moveTo(IO.canvas.width / 4 + changeInX, 0);
      road.lineTo(IO.canvas.width / 4 + changeInX, IO.canvas.height);
      road.lineTo(3 * IO.canvas.width / 4 + changeInX, IO.canvas.height);
      road.lineTo(3 * IO.canvas.width / 4 + changeInX, 0);
      road.lineTo(IO.canvas.width / 4 + changeInX, 0);
      //alert(changeInX);
      road.closePath();
      road.fill();
      road.stroke();
    },

    animate: function(xCoor, yCoor) {
      // update
      //var time = (new Date()).getTime() - startTime;
      console.log('animate ' + IO.xPos + ' ' + IO.yPos);
      //alert("wow");
      IO.drawRoad();
      IO.drawCar();
      //ctx.clearRect(xCoor,yCoor,150,20);
      var randX = 0;
      if (yCoor > IO.canvas.height) {
        xCoor = Math.random() * (IO.canvas.width - 200) + 50;
        yCoor = 0;
      }
      IO.drawObstacle(xCoor + randX, yCoor);
      // request new frame
      //IO.gameLoop(ctx, xCoor, yCoor + 5);
      gameLoop();
    },
    drawObstacle: function(xCoor, yCoor) {
      GG.ctx.rect(xCoor, yCoor, 150, 20);
      //ctx.beginPath();
      //ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI,true);
      ctx.stroke();

    }
}


function updateDataToServer(mouseX, windowWidth) {
  //console.log('Received X coordinate ' + mouseX + " from client!");
  //console.log('Current Velocity:' + velocity);
  var playerVelocityInput = (mouseX - windowWidth / 2.0) / windowWidth;
  playerVelocityInput = Math.max(-1, Math.min(playerVelocityInput, 1));
  playerVelocityInput *= velocityMultiplier;
  updateVelocity(playerVelocityInput);
  //gameSocket.emit('IHaveReceivedYourCoordinates');
};

function update(deltaTime) {
  updatePosition(deltaTime);
  updateGameStatus(checkCollisions());
}

function updatePosition(deltaTime) {
  xPos += velocity * deltaTime;
  yPos += deltaTime * forwardSpeed;
}

function updateVelocity(newVelocity) { //Adds a player's wheel setting to a moving average, asynchronous

  velocity -= velocity / numPlayers; //Call this once per update interval for each user
  velocity += newVelocity / numPlayers;

}

function updateGameStatus(collisionOccurred) {
  if (yPos > TRACK_LENGTH) {
    gameState = GAME_OVER_WON;
  } else if (collisionOccurred) {
    gameState = GAME_OVER_LOST;
  }
}

function checkCollisions() {
  if (Math.abs(xPos) > BOUND) {
    return true;
  } //TODO: check obstacle collisions
}

function getRotationValue() {
  return Math.atan(forwardSpeed / velocity);
}
