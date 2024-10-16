const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const serverUrl = 'http://45.83.107.132:5000/project_ghost/';
//const serverUrl = 'http://localhost:5000/project_ghost/';
const level_seed = Math.floor(Date.now() / 1000);

// Game settings
let gameSpeed = 5;
let gravity = 0.4;
let isPaused = true; // Game starts paused (until "T" is pressed)
let gameStarted = false; // Tracks whether the game has started
let isGameOver = false; // Tracks if the game is over

let gameScore = 0;
let nameEnter = false;
const scoreCategories = ["daily", "weekly", "allTime"];

// Game loop
let frame = 0;
function gameLoop() {
    if (!isGameOver && !isPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dino logic
        dino.update();
        dino.draw();

        // Obstacle logic
        if (frame % 100 === 0) {
            spawnObstacle();
        }
        updateObstacles();
        detectCollision();

        // Increase the player's score every ten frames
        if (frame % 10 === 0) gameScore++;
        displayText("Score: " + gameScore, 24, 'black', 20, 20);
        frame++;
    }
    requestAnimationFrame(gameLoop);
}

// Start game loop on event
document.addEventListener('keydown', async (e) => {
    if (e.code === 'KeyT' && !gameStarted) {
        isPaused = false;
        gameStarted = true;
        gameLoop();
    }
});
