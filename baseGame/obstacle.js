import { dino } from '/baseGame/dino.js';
import { setGameOver, setPaused, setGameStarted, canvas, ctx, gameSpeed } from '/baseGame/game.js';
import { checkHighScore } from '/baseGame/score.js';

let obstacles = [];
let ghostImageLoaded = false;  
let groundImageLoaded = false;  

// Load images
const ghostImage = new Image();
ghostImage.src = '/assets/ghost_2.png';
ghostImage.onload = () => {
    ghostImageLoaded = true;  
};

const groundObstacleImage = new Image();
groundObstacleImage.src = '/assets/tombstone_1.png';
groundObstacleImage.onload = () => {
    groundImageLoaded = true;  
};

function spawnObstacle() {
    let size = Math.random() * 50 + 40;
    let airOrGround = Math.random() < 0.5 ? canvas.height - size : canvas.height - size - 40;
    obstacles.push({
        x: canvas.width,
        y: airOrGround,
        width: size,
        height: size,
        speed: gameSpeed,
        isAirObstacle: airOrGround < canvas.height - size  // True if obstacle is in the air
    });
}

function updateObstacles(deltaTime) {
    if (obstacles.length === 0) return; // Skip if no obstacles
    
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= obs.speed * deltaTime;

        // Remove obstacles that move off-screen
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            i--;
        }

        // Draw obstacle based on its type
        if (obs.isAirObstacle && ghostImageLoaded) {
            ctx.drawImage(ghostImage, obs.x, obs.y, obs.width, obs.height);
        } else if (!obs.isAirObstacle && groundImageLoaded) {
            ctx.drawImage(groundObstacleImage, obs.x, obs.y, obs.width, obs.height);
        } else {
            // Fallback to a red rectangle if images aren't loaded yet
            ctx.fillStyle = 'red';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
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
            setGameOver(true);
            setPaused(true);
            setGameStarted(false);
            checkHighScore();  
        }
    }
}

export { spawnObstacle, updateObstacles, detectCollision, obstacles };
