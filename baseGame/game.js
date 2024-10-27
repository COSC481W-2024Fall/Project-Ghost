import { spawnObstacle, updateObstacles, detectCollision, obstacles } from './obstacle.js';
import { dino } from './dino.js';
import { displayText, initializeLeaderboard } from './ui.js';


const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const serverUrl = 'http://45.83.107.132:5000/project_ghost/';
//const serverUrl = 'http://localhost:5000/project_ghost/';
const level_seed = Math.floor(Date.now() / 1000);


// Game settings
let lastTime = 0;
let gameSpeed = 5;
let gravity = .4;
let isPaused = false; // Game starts paused (until "T" is pressed)
let gameStarted = false; // Tracks whether the game has started
let isGameOver = false; // Tracks if the game is over

let gameScore = 0;
let nameEnter = false;
const scoreCategories = ["daily", "weekly", "allTime"];



// Game loop
let frame = 0;
let isLoopRunning = false;
let lastObstacleSpawnTime = 0;
const obstacleSpawnInterval = 1500; // Adjust this to control the spawn frequency in milliseconds

function gameLoop(currentTime) {
    // Calculate delta time in seconds
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime=currentTime;
   // console.log("Delta Time:", deltaTime);
    
    if (!isGameOver && !isPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dino logic
        dino.update(deltaTime);
        dino.draw();

        // Obstacle logic
        if (currentTime - lastObstacleSpawnTime >= obstacleSpawnInterval) {
            spawnObstacle();
            lastObstacleSpawnTime = currentTime; // Update the last spawn time
        }
        updateObstacles(deltaTime);
        detectCollision();

        // Increase the player's score every ten frames
        if (frame % 10 === 0) {
            gameScore++;
        }
        displayText("Score: " + gameScore, 24, 'black', 20, 20);
        frame++;
    }
    
    // Only continue the loop if the game is running
    if (!isGameOver && !isPaused) {
        requestAnimationFrame(gameLoop);
    } else {
        isLoopRunning = false; // Reset the loop running flag if the game stops
    }
}


export function startGameLoop() {
    if (!isLoopRunning) {
        isLoopRunning = true;
        frame = 0;           // Reset frame counter when starting
        gameScore = 0; 
        gameLoop();
    }
}

export function stopGameLoop() {
    isLoopRunning = false;
    setPaused(true);
}

export function resetGame() {
    setGameOver(false);
    setPaused(false); // Ensure game is unpaused on reset
    setFrame(0);
    setGameScore(0);
    setGameSpeed(5);
    obstacles.length = 0; // Clear existing obstacles
    dino.y = canvas.height - dino.height; // Reset dino's position
    lastObstacleSpawnTime = 0;
    stopGameLoop(); // Stop the game loop if it’s running
    displayLeaderboard(false, null);
    document.getElementById('diedScreen').style.display = 'none';  // Hide overlay
    document.getElementById('diedWellScreen').style.display = 'none';  // Hide overlay
}


export function getGameOver() {
    return isGameOver;
}
export function setGameOver(state) {
    isGameOver = state;
}
export function getPaused() {
    return isPaused;
}
export function setPaused(state) {
    isPaused = state;
}
export function getGameStarted() {
    return gameStarted;
}
export function setGameStarted(state) {
    gameStarted = state;
}
// Getter function
export function getNameEnter() {
    return nameEnter;
}

// Setter function
export function setNameEnter(state) {
    nameEnter = state;
}
// Getter and Setter for gameScore
export function getGameScore() {
    return gameScore;
}

export function setGameScore(score) {
    gameScore = score;
}

// Getter and Setter for frame
export function getFrame() {
    return frame;
}

export function setFrame(newFrame) {
    frame = newFrame;
}

// Getter and Setter for gameSpeed
export function getGameSpeed() {
    return gameSpeed;
}

export function setGameSpeed(speed) {
    gameSpeed = speed;
}


export{ gameStarted, isGameOver, isPaused, gameScore, canvas, ctx, frame, gravity, serverUrl, level_seed, gameSpeed, gameLoop, nameEnter, scoreCategories};