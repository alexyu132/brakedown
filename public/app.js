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
        },

        /**
         * The client is successfully connected!
         */
        onConnected: function() {
            // Cache a copy of the client's socket.IO session ID on the App
            console.log('Connected to server!');

            IO.socket.emit('IAmReadyToPlay');

            setInterval(function() {
              // method to be executed;
              IO.socket.emit('CoordinateData');
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
