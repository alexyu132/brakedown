//jQuery(function($) {
'use strict';

/**
 * All the code relevant to Socket.IO is collected in the IO namespace.
 *
 * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
 */
var IO = {
  xPos: 0,
  yPos: 0,
  canvas: null,
  /**
   * This is called when the page is displayed. It connects the Socket.IO client
   * to the Socket.IO server
   */
  init: function() {
    //alert("init");
    IO.socket = io.connect();
    IO.bindEvents();
    //alert("here?");
    IO.canvasApp();
    //window.addEventListener("load", io.canvasApp, false);

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
  updateDataToClient: function(xPosit, yPosit, velocity) {
    IO.xPos = xPosit;
    IO.yPos = yPosit;
    //console.log('PositionX: ' + xPos);
    //console.log('PositionY: ' + yPos);
    //console.log('Velocity: ' + velocity);
  },

  serverReceivedCoord: function() {
    console.log('The server received the sent coordinates!');
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
  onConnected: function() {
    // Cache a copy of the client's socket.IO session ID on the App
    console.log('Connected to server!');

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
      console.log(mouseX);
      IO.socket.emit('CoordinateData', mouseX, window.innerWidth);
    }, 100);
  },


  /**
   * An error has occurred.
   * @param data
   */
  error: function(data) {
    alert(data.message);
  },

  canvasApp: function() {
    IO.canvas = document.getElementById("myCanvas");
    var ctx = IO.canvas.getContext("2d");
    IO.drawRoad();
    IO.drawCar();
    alert("ok");
    var randStartX = Math.random() * (IO.canvas.width - 100) + 50;
    IO.drawObstacle(ctx, randStartX, 0);
    alert("here?");
    //setTimeout(function() {
    var startTime = (new Date()).getTime();
    //  IO.animate(ctx, randStartX, 0, startTime);
    //}, 1000);
    alert("doggy");
    IO.gameLoop(ctx, randStartX, 0, startTime);
  },
  gameLoop: function(ctx, xCoor, yCoor, startTime) {
    while (true) {
      alert("HERe");
      alert("MORE");
      setTimeout(function() {
        var startTime = (new Date()).getTime();
        IO.animate(ctx, xCoor, yCoor + 5, startTime);
      }, 100);
    }
  },

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

  animate: function(ctx, xCoor, yCoor, startTime) {
    // update
    var time = (new Date()).getTime() - startTime;

    IO.drawRoad();
    IO.drawCar();
    //ctx.clearRect(xCoor,yCoor,150,20);
    var randX = 0;
    if (yCoor > IO.canvas.height) {
      xCoor = Math.random() * (IO.canvas.width - 200) + 50;
      yCoor = 0;
    }
    IO.drawObstacle(ctx, xCoor + randX, yCoor);
    // request new frame

  },
  drawObstacle: function(ctx, xCoor, yCoor) {
    ctx.rect(xCoor, yCoor, 150, 20);
    //ctx.beginPath();
    //ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI,true);
    ctx.stroke();

  }
};

IO.init();

//}($));
