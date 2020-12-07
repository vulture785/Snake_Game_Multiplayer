const snakeGrowth = 1;
const cellSize = 30;

class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Point(this.x, this.y);
    }

    equals(other) {
        return other.x === this.x && other.y === this.y;
    }
}

const gridSize = new Point(960 / cellSize, 540 / cellSize);

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function snakeColor() {
    let colors = [];
    let colorFinal = [];

    /*
    colors[0] = ParseInt(color.substring(1,3), 16);
    colors[1] = ParseInt(color.substring(3,5), 16);
    colors[2] = ParseInt(color.substring(5,7), 16);
    */

    colors[0] = getRandomArbitrary(55, 255)
    colors[1] = getRandomArbitrary(55, 255)
    colors[2] = getRandomArbitrary(55, 255)
    colorFinal[0] = 'rgb(' + colors[0] + ',' + colors[1] + ',' + colors[2] + ')';
    colorFinal[1] = 'rgb(' + (colors[0] - 55) + ',' + (colors[1] - 50) + ',' + (colors[2] - 50) + ')';
    return colorFinal;
}

class Snake {
    constructor(id, segments = [], direction = "right", colors) {
        this.id = id;
        this.segments = segments;
        this.direction = direction;
        this.colors = colors;
    }

    move() {
        // Copy each element to the previous one
        for (let i = this.segments.length - 1; i > 0; i--) {
            this.segments[i] = this.segments[i - 1].clone();
        }

        // Advance the head in the current direction
        if (this.direction === "left") {
            this.segments[0].x = (this.segments[0].x + gridSize.x - 1) % gridSize.x;
        } else if (this.direction === "right") {
            this.segments[0].x = (this.segments[0].x + gridSize.x + 1) % gridSize.x;
        } else if (this.direction === "up") {
            this.segments[0].y = (this.segments[0].y + gridSize.y - 1) % gridSize.y;
        } else if (this.direction === "down") {
            this.segments[0].y = (this.segments[0].y + gridSize.y + 1) % gridSize.y;
        } else {
            throw new Error("Invalid direction");
        }
    }

    grow(amount) {
        // Add a bunch of dummy segments to the end
        const lastSegment = this.segments[this.segments.length - 1];
        for (let i = 0; i < amount; i++) {
            this.segments.push(lastSegment.clone());
        }
    }

    hitsObstacle(gameState) {
        const head = this.segments[0];
        // Check the head of the snake against the walls
        for (const wall of gameState.walls) {
            if (head.equals(wall)) return true;
        }

        // Check the head against other segments of the snake
        for (let i = 1; i < this.segments.length; i++) {
            if (head.equals(this.segments[i])) return true;
        }

        return false;
    }

    hitsApple(gameState) {
        const head = this.segments[0];

        // Check the head of the snake against the walls
        if (head.equals(gameState.apple)) return true;

        return false;
    }

    updateDirection(direction) {
        if (!areOppositeDirections(this.direction, direction)) {

            this.direction = direction;
        }
    }
}

export class GameState {
    constructor() {
        this.status = "ready"; // ready, playing, over
        this.snakes = [];
        this.walls = [new Point(13, 7), new Point(0, 12), new Point(1, 12), new Point(2, 12), new Point(12, 7), new Point(12, 8), new Point(12, 9)];
        this.apple = new Point(10, 10);
    }
    play() {

    }
    update() {
        for (let snake of this.snakes) {
            snake.move();

            if (snake.hitsApple(this)) {
                snake.grow(snakeGrowth);
                this.moveApple();
            }

            if (snake.hitsObstacle(this)) {
                let index = this.snakes.indexOf(snake);
                this.snakes.splice(index, 1)
                    //this.status = "over";
            }
        }
    }
    restart() {

    }
    findSnakeById(id) {
        for (let snake of this.snakes) {
            if (snake.id == id) {
                return snake
            }
        }
        return -1
    }
    moveApple() {
            this.apple = new Point(Math.floor(Math.random() * gridSize.x), Math.floor(Math.random() * gridSize.y));
        }
        /*
            addSnake(id) {
                this.snakes.push(new Snake(id, [new Point[27, 4]], "up"))
            }*/
}


function areOppositeDirections(a, b) {
    return (
        (a === "left" && b === "right") ||
        (a === "right" && b === "left") ||
        (a === "up" && b === "down") ||
        (a === "down" && b === "up")
    );
}
let idSocket = 0
export class GameController {
    constructor(gameState) {
        this.gameState = gameState;
        this.intervalId = 0;
        this.socketToId = new Map();
    }
    addSocket(socket) {
        this.socketToId.set(socket, idSocket);

        switch (idSocket % 3) {
            case 0:
                this.gameState.snakes.push(new Snake(idSocket, [
                    new Point(5, 4),
                    new Point(4, 4),
                    new Point(3, 4),
                    new Point(2, 4),
                ], "right", snakeColor()))
                break;
            case 1:
                this.gameState.snakes.push(new Snake(idSocket, [
                    new Point(25, 14),
                    new Point(24, 14),
                    new Point(23, 14),
                    new Point(22, 14),
                ], "down", snakeColor()))
                break;
            case 2:

                this.gameState.snakes.push(new Snake(idSocket, [
                    new Point(15, 14),
                    new Point(16, 14),
                    new Point(16, 13),
                    new Point(16, 12),
                ], "left", snakeColor()))
                break;

            default:
                break;
        }

        idSocket++;
    }
    removeSocket(socket) {
        var index = this.socketToId.get(socket)
        var list = this.gameState.snakes.indexOf(this.gameState.findSnakeById(index));
        if (list > -1) {
            this.gameState.snakes.splice(list, 1)
        }
        this.socketToId.delete(socket);
    }

    acceptMessage(socket, message) {
        this.gameState.findSnakeById(this.socketToId.get(socket)).updateDirection(message["changeDirection"])
    }
    startGame() {
        this.gameState.status = "playing";
        this.intervalId = setInterval(() => this.loop(), 100);
    }

    stopGame() {
        clearInterval(this.intervalId);
    }
    
    loop() {
        if (this.gameState.status === "playing") {
            this.gameState.update();
        }
        if (this.gameState.status === "over") {
            this.stopGame()
        }

        for (let elem of this.socketToId.keys()) {
            elem.send(JSON.stringify({ "gameState": this.gameState }));
        }
    }
}