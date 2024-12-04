import { spawnObstacle, updateObstacles, obstacles } from './obstacle.js';
import { dino } from './dino.js';
import { displayText } from './ui.js';

const levelSeed = Math.floor(Date.now() / 1000);
// const levelSeed = 1731697424;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const serverUrl = 'http://45.83.107.132:5000/project_ghost/';
//const serverUrl = 'http://localhost:5000/project_ghost/';


// Add background music
const backgroundMusic = new Audio('/baseGame/sounds/game-level-music.mp3');
backgroundMusic.loop = true; // Loop the music for continuous play
backgroundMusic.volume = 0.5; // Set volume (0.0 to 1.0)

// Game settings
let lastTime = Date.now();
let gameSpeed = 5;
let gravity = .4;
let isPaused = false; // Game starts paused (until "T" is pressed)
let gameStarted = false; // Tracks whether the game has started
let isGameOver = false; // Tracks if the game is over

let gameScore = 0;
let lastGameScoreTime = 0;
let nameEnter = false;
const scoreCategories = ["daily", "weekly", "allTime"];



// Game loop
let frame = 0;
let isLoopRunning = false;
let lastObstacleSpawnTime = 0;
let obstacleSpawnInterval = 1.2 * 1000; // Adjust this to control the spawn frequency in milliseconds

function gameLoop() {
    // Calculate delta time in seconds
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 10;
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

        // Add one to the score twice a second, independent of framerate
        if (currentTime - lastGameScoreTime >= 500) {
            gameScore++;
            lastGameScoreTime = currentTime;
            if (gameSpeed < 11.9) {
                gameSpeed += 0.03;
                obstacleSpawnInterval -= (gameSpeed * 0.3); // rate of obstacle spawn increase
            }
          //  console.log(gameSpeed, obstacleSpawnInterval);
        }
        
        displayText("Score: " + gameScore, 24, 'white', 20, 20);
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
        if (!backgroundMusic.playing) {
            backgroundMusic.play().catch((error) => console.warn("Music playback error:", error));
        }
        isLoopRunning = true;
        frame = 0;           // Reset frame counter when starting
        gameScore = 0; 
        lastObstacleSpawnTime = Date.now(); // Delay first obstacle spawn
        gameLoop();
    }
}

export function stopGameLoop() {
    isLoopRunning = false;
    backgroundMusic.pause(); // Pause the music
    setPaused(true);
}
function clearObstacles() {
    obstacles.length = 0; // Clear existing obstacles
}

export function resetGame() {
    setGameOver(false);
    setPaused(false); // Ensure game is unpaused on reset
    setFrame(0);
    setGameScore(0);
    setGameSpeed(5);
    dino.y = canvas.height - dino.height; // Reset dino's position
    stopGameLoop(); // Stop the game loop if it’s running
    clearObstacles(); // Clear all obstacles
    lastObstacleSpawnTime = Date.now(); // Delay first obstacle from spawning on top of the player
    const leaderboard = document.querySelector("#leaderboardContainer");
    if(leaderboard) leaderboard.remove();
    document.getElementById('diedScreen').style.display = 'none';  // Hide overlay
    document.getElementById('diedWellScreen').style.display = 'none';  // Hide overlay
    let element = document.getElementById('titleOverlay');  // Replace 'elementID' with the actual ID
if (element) {
    element.style.display = 'none';  // Or whatever style manipulation you need
} else {
    console.warn("Element with ID 'elementID' not found in resetGame().");
}

}


export function getGameOver() {
    return isGameOver;
}
export function setGameOver(state) {
    isGameOver = state;

    if (isGameOver) {
        if (backgroundMusic) {
            backgroundMusic.pause(); // Pause the music
            backgroundMusic.currentTime = 0; // Reset to the beginning
        }
    }
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


export{ gameStarted, isGameOver, isPaused, gameScore, canvas, ctx, frame, gravity, serverUrl, levelSeed, gameSpeed, gameLoop, nameEnter, scoreCategories};
