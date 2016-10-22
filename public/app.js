//jQuery(function($) {
'use strict';

/**
 * All the code relevant to Socket.IO is collected in the IO namespace.
 *
 * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
 */
var oldAngle = 0;
var turnAccel = 0;

var IO = {

  bounds: 0,

  trackLength: 0,

  /**
   * This is called when the page is displayed. It connects the Socket.IO client
   * to the Socket.IO server
   */
  init: function() {
    IO.socket = io.connect();
    IO.bindEvents();
  },

  /**
   * While connected, Socket.IO will listen to the following events emitted
   * by the Socket.IO server, then run the appropriate function.
   */
  bindEvents: function() {
    IO.socket.on('connected', IO.onConnected);
    IO.socket.on('IHaveReceivedYourCoordinates', IO.serverReceivedCoord);
    IO.socket.on('GameEnded', IO.gameEnded);
    IO.socket.on('SendDataToClient', IO.updateDataToClient);

  },

  updateDataToClient: function(xPos, yPos, angle, obstacleArray) {
    //console.log('PositionX: ' + xPos);
    //console.log('PositionY: ' + yPos);
    //console.log('Velocity: ' + velocity);
    //console.log(obstacleArray);

    yPos = -yPos;

    //update the drawing
    var canvas = document.getElementById("myCanvas");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //draw car
    var car = canvas.getContext("2d");
    car.save();
    var road = car;
    var checker = car;
    var line = car;
    var obstacle = car;
    //road.save();

    road.translate(-xPos + canvas.width / 2, -yPos + canvas.height * .75);

    road.fillStyle = "#222222";
    road.fillRect(-IO.bounds, -IO.trackLength, IO.bounds * 2, IO.trackLength *
      2);

    for (var i = 0; i < IO.trackLength / 80; i++) {
      line.fillStyle = "#FFFFFF";
      line.fillRect(-10, canvas.height - i * 200, 20, 80);
    }

    var checkSize = IO.bounds / 10;
    var checkLen = checkSize * 4;
    checker.fillStyle = "#000000";
    checker.fillRect(-IO.bounds, -IO.trackLength, IO.bounds * 2,
      checkLen);
    checker.fillStyle = "#FFFFFF";
    for (var row = 0; row < 10; row++) {
      for (var col = 0; col < 4; col++) {
        var whiteRow = 0;
        if (col == 0 || col == 2) {
          whiteRow = row * 2;
        } else {
          whiteRow = row * 2 + 1;
        }
        checker.fillRect(-IO.bounds + whiteRow * checkSize, -IO.trackLength +
          col * checkSize, checkSize, checkSize);
      }
    }

    obstacle.fillStyle = "#FFEE00";
    for (var i = 0; i < obstacleArray.length; i++) {

      obstacle.fillRect(obstacleArray[i].leftBound, -obstacleArray[i].yLocation -
        80, obstacleArray[i].rightBound - obstacleArray[i].leftBound, 80);
    }

    turnAccel = (angle - oldAngle) * 0.3;

    oldAngle += turnAccel;
    car.fillStyle = "#ff0000";
    car.translate(xPos, yPos + 20);
    car.rotate(oldAngle);
    car.translate(-xPos, -yPos + 20);

    car.beginPath();
    car.moveTo(xPos, yPos);

    car.lineTo(xPos + 40, yPos + 40);
    car.lineTo(xPos, yPos - 40);
    car.lineTo(xPos - 40, yPos + 40);

    car.closePath();
    car.fill();
    car.stroke();



    car.restore();


    console.log("Player yPos: " + yPos);


  },


  gameEnded(playerWon) {
    if (playerWon) {
      console.log('You win!');
    } else {
      console.log('You lose!');
    }
  }, //TODO: actually end the game, allow user(s) to restart


  /**
   * The client is successfully connected!
   */
  onConnected: function(bounds, trackLength) {
    // Cache a copy of the client's socket.IO session ID on the App
    IO.bounds = bounds;
    IO.trackLength = trackLength;
    console.log('bounds:' + bounds + " track length:" + trackLength);
    //IO.socket.emit('IAmReadyToPlay');
    var mouseX = 0;
    document.onmousemove = handleMouseMove;

    function handleMouseMove(event) {
      var dot, eventDoc, doc, body, pageX, pageY;

      event = event || window.event; // IE-ism

      // If pageX/Y aren't available and clientX/Y are,
      // calculate pageX/Y - logic taken from jQuery.
      // (This is to support old IE)
      if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
          (doc && doc.scrollTop || body && body.scrollTop || 0) -
          (doc && doc.clientTop || body && body.clientTop || 0);
      }

      // Use event.pageX / event.pageY here

      mouseX = event.pageX;
    }

    setInterval(function() {
      // method to be executed;
      //console.log(mouseX);
      IO.socket.emit('CoordinateData', mouseX, window.innerWidth);
    }, 100);
  },


  /**
   * An error has occurred.
   * @param data
   */
  error: function(data) {
    alert(data.message);
  }

};

IO.init();

//}($));
