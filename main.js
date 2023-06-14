/*
 +-------------------------------------------+
 |=============< SNAKE GAME >================|
 |                                           |
 |   AUTHOR: IMON RAJ                        |
 |   JADAVPUR UNIVERSITY                     |
 |   COMPUTER SCIENCE AND ENGINEERING DEPT.  |
 |   LANGUAGE USED - HTML, CSS, JAVASCRIPT   |
 |   PROJECT CREATION TIME - DECEMBER 2022   |
 |                                           |
 +-------------------------------------------+
 */




/** @type {HTMLCanvasElement} */
//REFERRING TO THE CANVAS ELEMENT
//CONSIDERING THEM AS GLOBAL VARIABLES
const canvas = document.querySelector('.main-canvas');
const ctx = canvas.getContext('2d');
const dpi = window.devicePixelRatio;
canvas.width = 400 * dpi;
canvas.height = 400 * dpi;
const squareSize = 16 * dpi;
const dim = canvas.height / squareSize; // dimension in terms of pixels per side
canvas.style.width = "400px";
canvas.style.height = "400px";


//testing something related to branching

//some references to the DOM elements
const overlay = document.querySelector('.overlay');
const gameOverContainer = document.querySelector('.game-over-container');
const scoreEl = document.getElementById('score');
let score;


//some color variables to be used
let bgcolor = "#333";
let snakecolor = "#0f0";
let foodcolor = "#f60";

// animation duration
let dur = 150;


// draw a pixel with specific color
function drawPixel(x, y, color) {
    ctx.beginPath();
    if (color == bgcolor) {
        ctx.fillStyle = color;
        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        return;
    }
    ctx.fillStyle = color + "6";
    ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    ctx.beginPath();

    ctx.fillStyle = color;
    ctx.fillRect(x * squareSize + 2, y * squareSize + 2, squareSize - 4, squareSize - 4);
}

//creating snake class
class Snake {
    constructor() {
        Snake._instance = this;
        this.boxes = [[10, 10], [11, 10], [12, 10]];
        this.count = 3;
        this.movement = "Right";
        this.foodlist = [];


        document.body.addEventListener('keydown', function (event) {
            const key = event.key;
            switch (key) {
                case "ArrowLeft":
                    if (Snake._instance.movement != "Right")
                        Snake._instance.movement = 'Left';
                    break;
                case "ArrowRight":
                    if (Snake._instance.movement != "Left")
                        Snake._instance.movement = 'Right';
                    break;
                case "ArrowUp":
                    if (Snake._instance.movement != "Down")
                        Snake._instance.movement = 'Up';
                    break;
                case "ArrowDown":
                    if (Snake._instance.movement != "Up")
                        Snake._instance.movement = 'Down';
                    break;
            }
        });
    }

    // for singleton usecase -- not used yet
    // kept for later probable use
    static getInstance() {
        if (!Snake._instance) {
            new Snake();
        }
        return Snake._instance;
    }

    // generates a food piece at a random 
    // point within the canvas except the 
    // points where snake resides
    generateFoodPiece() {
        let x, y;
        do {
            x = Math.floor(Math.random() * dim);
            y = Math.floor(Math.random() * dim);
        }
        while (this.selfCollision([x, y]))

        drawPixel(x, y, foodcolor);
        this.foodlist.push([x, y]);

        if (this.foodlist.length > 2) {
            drawPixel(this.foodlist[0][0], this.foodlist[0][1], bgcolor);
            this.foodlist.shift();
        }
    }

    // continuously generated food pieces
    // in intervals
    generateFoods() {
        this.generateFoodPiece();

        return setInterval(() => {
            Snake._instance.generateFoodPiece();
        }, dur * Math.floor(dim / 1.2));
    }

    //
    // detects whether the snake head
    // does any collision to any of the
    // food items
    foodCollision(pix) {
        if (this.foodlist.length == 0) return false;
        for (let i = 0; i < this.foodlist.length; i++) {
            if (pix[0] == this.foodlist[i][0] && pix[1] == this.foodlist[i][1]) {
                score += 50;
                scoreEl.innerHTML = score;
                this.foodlist.splice(i, 1);
                if (this.foodlist.length == 0) this.generateFoodPiece();
                return true;
            }
        }
        return false;
    }

    // snake collision with its own body
    selfCollision(pix) {
        if (this.boxes.length == 0) return false;
        for (let i = 0; i < this.boxes.length; i++) {
            if (pix[0] == this.boxes[i][0] && pix[1] == this.boxes[i][1]) {
                // this.boxes.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    // collision with the edges of the canvas
    edgeCollision(pix) {
        if (pix[0] < 0 || pix[1] < 0 || pix[0] >= dim || pix[1] >= dim) {
            return true;
        }
        return false;
    }

    // moves the snake according to movement direction
    moveSnake() {
        let lastBox = this.boxes[this.count - 1];
        let newBox = [lastBox[0], lastBox[1]];

        if (this.movement == "Left")
            newBox[0]--;

        if (this.movement == "Right")
            newBox[0]++;

        if (this.movement == "Up")
            newBox[1]--;

        if (this.movement == "Down")
            newBox[1]++;

        if (this.selfCollision(newBox)) return false;
        if (this.edgeCollision(newBox)) return false;

        //length kept constant if no food is taken
        if (!this.foodCollision(newBox)) {
            drawPixel(this.boxes[0][0], this.boxes[0][1], bgcolor);
            this.boxes.shift();
        }
        else { // length is increased by not deleting the tail box
            this.count++;
        }

        this.boxes.push(newBox);
        drawPixel(newBox[0], newBox[1], bgcolor);
        drawPixel(newBox[0], newBox[1], snakecolor);
        return true;
    }

    drawSnake() {
        this.boxes.forEach(e => {
            drawPixel(e[0], e[1], snakecolor);
        });
    }
}

let animation, foodinter; // to control the interval functions
function newGame() {  // INITIATES A NEW GAME TO BE PLAYED
    gameOverContainer.classList.remove("visible");
    overlay.classList.remove("visible");
    score = 0;
    scoreEl.innerHTML = score;
    clearInterval(animation);
    clearInterval(foodinter);
    ctx.fillStyle = bgcolor;
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let snake = new Snake();
    snake.drawSnake();
    foodinter = snake.generateFoods();

    animation = setInterval(() => {
        if (!snake.moveSnake()) {
            clearInterval(animation);
            clearInterval(foodinter);
            gameOverContainer.classList.add("visible");
            overlay.classList.add("visible");
            document.getElementById('game-over-final-score').innerHTML = score;
        }
    }, dur);
}

overlay.addEventListener('click', newGame);
newGame();