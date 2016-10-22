jQuery(function($) {
    'use strict';

    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
     */
    var IO = {
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
        },
        serverReceivedCoord: function() {
            console.log('The server received the sent coordinates!');
        },
        /**
         * The client is successfully connected!
         */
        onConnected: function() {
            // Cache a copy of the client's socket.IO session ID on the App
            console.log('Connected to server!');

            IO.socket.emit('IAmReadyToPlay');
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
                IO.socket.emit('CoordinateData', mouseX);
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

}($));
