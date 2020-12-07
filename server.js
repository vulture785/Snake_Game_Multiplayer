import express from "express";
import path from "path";
import reload from "reload";
import * as game from "./game.js"
import expressWs from "express-ws";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    console.log("got request");

    const filePath = path.resolve("client/client.html");
    res.sendFile(filePath);
});

app.use(express.static("client"));
async function start() {

    //gc.startGame();
    try {
        await reload(app);
    } catch (err) {
        console.error("Error with reload", err);
    }

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
}

let gameState = new game.GameState();
let gc = new game.GameController(gameState);
let listeSocket = []
expressWs(app);
start();
app.ws('/socket', (socket, req) => {
    console.log("new socket connection");
    gc.addSocket(socket);
    listeSocket.push(socket);
    socket.on("message", (message) => {
        //console.log(listeSocket)
        //socket.send(JSON.stringify({ "gameState": gameState }));
        let mess = JSON.parse(message)
        if (mess["changeDirection"]) {
            gc.acceptMessage(socket, JSON.parse(message))
                // Echo the message back to the client
        } else if (mess["play"]) {
            gc.startGame()
        }
    });

    socket.on("close", (code) => {
        gc.removeSocket(socket)
        console.log("socket closed", code)
    });

    socket.on("error", (error) => console.log("socket error", error));
});