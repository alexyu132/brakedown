window.addEventListener("load", canvasApp, false);

function canvasApp() {
    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
    var canvas = document.getElementById("myCanvas");
    IO.socket.on('SendDataToClient', drawCar);

    function drawCar(xPos, yPos, velocity) {
        console.log('PositionX: ' + xPos);
        console.log('PositionY: ' + yPos);
        var car = canvas.getContext("2d");
        car.fillStyle = "#FF0000";
        car.beginPath();
        car.moveTo(xPos, canvas.height);

        car.lineTo(xPos + 20, canvas.height - 20);
        car.lineTo(xPos, canvas.height - 60);
        car.lineTo(xPos - 20, canvas.height - 20);

        car.closePath();
        car.fill();
        car.stroke();
    }

    function drawRoad() {
        var grass = canvas.getContext("2d");
        grass.fillStyle = "#66cc00";
        grass.fillRect(0, 0, canvas.width, canvas.height);

        var road = canvas.getContext("2d");
        road.fillStyle = "#F8A757";
        road.beginPath();
        road.moveTo(canvas.width / 4, 0);
        road.lineTo(canvas.width / 4, canvas.height);
        road.lineTo(3 * canvas.width / 4, canvas.height);
        road.lineTo(3 * canvas.width / 4, 0);
        road.lineTo(canvas.width / 4, 0);
        road.closePath();
        road.fill();
        road.stroke();
    }

    function animate(ctx, xCoor, yCoor, startTime) {
        // update
        var time = (new Date()).getTime() - startTime;

        drawRoad();
        //drawCar();
        //ctx.clearRect(xCoor,yCoor,150,20);
        var randX = 0;
        if (yCoor > canvas.height) {
            xCoor = Math.random() * (canvas.width - 200) + 50;
            yCoor = 0;
        }
        drawObstacle(ctx, xCoor + randX, yCoor);
        // request new frame
        requestAnimFrame(function() {
            animate(ctx, xCoor + randX, yCoor + 5, startTime);
        });
    }

    function drawObstacle(ctx, xCoor, yCoor) {
        ctx.rect(xCoor, yCoor, 150, 20);
        //ctx.beginPath();
        //ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI,true);
        ctx.stroke();

    }
    //alert("HELO?");
    var ctx = canvas.getContext("2d");
    drawRoad();
    drawCar();
    //alert("HI");
    var randStartX = Math.random() * (canvas.width - 100) + 50;
    drawObstacle(ctx, randStartX, 0);
    setTimeout(function() {
        var startTime = (new Date()).getTime();
        animate(ctx, randStartX, 0, startTime);
    }, 1000);
}
