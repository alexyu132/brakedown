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

    updateDataToClient: function(xPos, yPos, velocity, obstacleArray) {
        //console.log('PositionX: ' + xPos);
        //console.log('PositionY: ' + yPos);
        //console.log('Velocity: ' + velocity);
        //console.log(obstacleArray);

        //update the drawing
        var canvas = document.getElementById("myCanvas");

        //draw car
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.moveTo(xPos, canvas.height);

        ctx.lineTo(xPos + 20, canvas.height - 20);
        ctx.lineTo(xPos, canvas.height - 60);
        ctx.lineTo(xPos - 20, canvas.height - 20);

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

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
