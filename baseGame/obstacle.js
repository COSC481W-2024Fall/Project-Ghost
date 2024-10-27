import { dino } from './dino.js';
import { setGameOver, setPaused, setGameStarted, canvas, ctx, gameSpeed } from './game.js';
import { checkHighScore } from './score.js';

let obstacles = [];

function spawnObstacle() {
    let size = Math.random() * 50 + 20;
    let airOrGround = Math.random() < 0.5 ? canvas.height - size : canvas.height - size - 40;
    obstacles.push({
        x: canvas.width,
        y: airOrGround,
        width: size,
        height: size,
        speed: gameSpeed
    });
}

function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= obs.speed;

        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            i--;
        }

        ctx.fillStyle = 'red';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }
}

function detectCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];

        if (dino.x < obs.x + obs.width &&
            dino.x + dino.width > obs.x &&
            dino.y < obs.y + obs.height &&
            dino.y + dino.height > obs.y
        ) {
            console.log("Collision detected");
            setGameOver(true);  // Use setter function to change isGameOver
            setPaused(true);  // Pause the game
            setGameStarted(false);  // Mark the game as not started
            checkHighScore();  // Check high score after the game ends
        }
    }
}

export { spawnObstacle, updateObstacles, detectCollision, obstacles };