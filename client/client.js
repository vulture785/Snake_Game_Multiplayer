const cellSize = 30;
let frame = 0;
let lastFrameTime = 0;
let valeurSnake;
const url = `ws://${window.location.host}/socket`;
const socket = new WebSocket(url);
let sock = connectWebSocket();
let colors = [];
let colorTete;
let colorCorps;
let keyDown = null;
let gameState;
let doc = document.getElementById("color");

function fillGridCell(ctx, point) {
    ctx.fillRect(point.x * cellSize, point.y * cellSize, cellSize, cellSize);
}

function drawSegments(ctx, segments, colors) {
    // Draw head
    ctx.fillStyle = colors[0];
    fillGridCell(ctx, segments[0]);

    // Draw body
    ctx.fillStyle = colors[1];
    for (let i = 1; i < segments.length; i++) {
        fillGridCell(ctx, segments[i]);
    }
}

function drawWalls(ctx) {
    ctx.fillStyle = "green";
    for (const wall of gameState.walls) {
        fillGridCell(ctx, wall);
    }
}

function drawApple(ctx) {
    ctx.fillStyle = "yellow";
    fillGridCell(ctx, gameState.apple);
}

function drawMap(canvas, ctx) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.fillText(`Frame ${frame}`, 10, 10);

    if (gameState.status === "over") {
        ctx.fillText("Ouch!", 100, 200);
    }

    for (let snake of gameState.snakes) {
        drawSegments(ctx, snake.segments, snake.colors);
    }

    drawWalls(ctx);
    drawApple(ctx);

}

function onKeyDown(event) {
    event.preventDefault();
    keyDown = event.key;
    sens = null
    switch (keyDown) {
        case "ArrowDown":
            sens = "down"
            break;

        case "ArrowUp":
            sens = "up"
            break;

        case "ArrowLeft":
            sens = "left"
            break;

        case "ArrowRight":
            sens = "right"
            break;

        default:
            break;
    }
    if (sens)
        sock.send(JSON.stringify({ "changeDirection": sens }))
        //ici envoyer un changemeent de déplacement
}

function lancerPartie() {
    sock.send(JSON.stringify({"play": "yes" }))
    document.getElementById("LetsGo").setAttribute("disabled", true);
    start();
}

function connectWebSocket() {

    socket.onopen = () => {
        console.log("socket connected!");
    };

    socket.onmessage = (message) => {
        gameState = JSON.parse(message.data).gameState
    };

    socket.onerror = (error) => {
      console.error("socket error", error)
      document.getElementById("LetsGo").setAttribute("enabled", true);
    };

    return socket;
}

function gameLoop(frameTime) {
    // Don't go too fast!
    if (gameState) {
        const canvas = document.getElementsByTagName("canvas")[0];
        const ctx = canvas.getContext("2d");

        // Update
        if (gameState.status === "ready") {
            /*if (keyDown) {
                gameState.status = "playing";
                gameState.snake = makeNewSnake();
                rajouter un message a envoyer au serveur pour démarrer
            }*/

        } else if (gameState.status === "playing") {
            //envoyer le changement de direction au serveur

        } else if (gameState.status === "over") {
            //if (keyDown) gameState.status = "ready";
            //envoyer un message pour dire fin
        }
        drawMap(canvas, ctx);
        frame++;
        keyDown = null;
        lastFrameTime = frameTime;
    }
    requestAnimationFrame(gameLoop);
}

function start() {
    const canvas = document.getElementsByTagName("canvas")[0];
    canvas.addEventListener("keydown", onKeyDown);

    requestAnimationFrame(gameLoop);
}