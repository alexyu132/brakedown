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

        car.translate(-xPos + canvas.width / 2, -yPos + canvas.height *.75);

        car.fillStyle = "#222222";
        car.fillRect(-IO.bounds, -IO.trackLength, IO.bounds * 2, IO.trackLength * 2);


        car.fillStyle = "#FF0000";
        //car.fillRect(obstacleArray[0].leftBound, obstacleArray[0].yLocation, obstacleArray[0].rightBound - obstacleArray[0].leftBound, 50);

        for(var i = 0; i < obstacleArray.length; i++) {
          console.log(i + "leftBound: " + obstacleArray[i].leftBound);
          console.log(i + "rightBound: " + obstacleArray[i].rightBound);
          console.log(i + "yLocation: " + obstacleArray[i].yLocation);
          car.fillRect(obstacleArray[i].leftBound, obstacleArray[i].yLocation + 50, obstacleArray[i].rightBound - obstacleArray[i].leftBound, 50);
        }

        // car.save();
        // car.rotate(angle);
        car.beginPath();
        car.moveTo(xPos, yPos);

        car.lineTo(xPos + 20, yPos + 20);
        car.lineTo(xPos, yPos - 20);
        car.lineTo(xPos - 20, yPos + 20);

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
