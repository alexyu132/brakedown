
//jQuery(function($) {
    'use strict';

    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
     */
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
            IO.socket.on('IHaveReceivedYourCoordinates', IO.serverReceivedCoord );
            IO.socket.on('GameEnded', IO.gameEnded);
            IO.socket.on('SendDataToClient', IO.updateDataToClient);

        },

        updateDataToClient: function(xPos, yPos, velocity, obstacleArray) {
            console.log('PositionX: ' + xPos);
            console.log('PositionY: ' + yPos);
            console.log('Velocity: ' + velocity);
            console.log(obstacleArray);
        },

        serverReceivedCoord: function() {
            console.log('The server received the sent coordinates!');
        },

        gameEnded(playerWon) {
            if(playerWon) {
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
        }

    };

    IO.init();

//}($));




window.addEventListener("load", canvasApp, false);
function canvasApp(){
	window.requestAnimFrame = (function(callback) {
        	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || 		window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        	function(callback) {
       		   window.setTimeout(callback, 1000 / 60);
       		};
      	})();
	var canvas  = document.getElementById("myCanvas");
	IO.socket.on('SendDataToClient',drawCar);
	function drawCar(xPos,yPos,velocity){
		console.log('PositionX: ' + xPos);
            	console.log('PositionY: ' + yPos);
		var car = canvas.getContext("2d");
		car.fillStyle = "#FF0000";
		car.beginPath();
		car.moveTo(xPos,canvas.height);

		car.lineTo(xPos+20,canvas.height-20);
		car.lineTo(xPos,canvas.height-60);
		car.lineTo(xPos-20,canvas.height-20);

		car.closePath();
		car.fill();
		car.stroke();
	}
	function drawRoad(){
		var grass = canvas.getContext("2d");
      		grass.fillStyle = "#66cc00";
      		grass.fillRect(0,0,canvas.width,canvas.height);

		var road = canvas.getContext("2d");
		road.fillStyle = "#F8A757";
      		road.beginPath();
      		road.moveTo(canvas.width/4,0);
      		road.lineTo(canvas.width/4,canvas.height);
      		road.lineTo(3*canvas.width/4,canvas.height);
      		road.lineTo(3*canvas.width/4,0);
      		road.lineTo(canvas.width/4,0);
      		road.closePath();
      		road.fill();
      		road.stroke();
	}

	function animate(ctx,xCoor,yCoor,startTime) {
	        // update
	        var time = (new Date()).getTime() - startTime;

		drawRoad();
		//drawCar();
		//ctx.clearRect(xCoor,yCoor,150,20);
		var randX = 0;
		if (yCoor>canvas.height){
			xCoor = Math.random()*(canvas.width-200)+50;
			yCoor = 0;
		}
	        drawObstacle(ctx,xCoor+randX,yCoor);
	        // request new frame
	        requestAnimFrame(function() {
	          animate(ctx,xCoor+randX,yCoor+5,startTime);
	        });
      	}
	function drawObstacle(ctx,xCoor,yCoor){
		ctx.rect(xCoor,yCoor,150,20);
		//ctx.beginPath();
		//ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI,true);
		ctx.stroke();

	}
	//alert("HELO?");
	var ctx = canvas.getContext("2d");
	drawRoad();
	drawCar();
	//alert("HI");
	var randStartX = Math.random()*(canvas.width-100)+50;
	drawObstacle(ctx,randStartX,0);
	setTimeout(function() {
        	var startTime = (new Date()).getTime();
        	animate(ctx,randStartX,0,startTime);
      	}, 1000);
}
