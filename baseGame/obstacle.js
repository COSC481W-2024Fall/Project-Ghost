import { dino } from '/baseGame/dino.js';
import { setGameOver, setPaused, setGameStarted, canvas, ctx, gameSpeed } from '/baseGame/game.js';
import { checkHighScore } from '/baseGame/score.js';

let obstacles = [];
let ghostImageLoaded = false;  
let groundImageLoaded = false;  

// Load images
const ghostImage = new Image();
ghostImage.src = '/assets/ghost_2.PNG';
ghostImage.onload = () => {
    ghostImageLoaded = true;  
};

const groundObstacleImage = new Image();
groundObstacleImage.src = '/assets/tombstone_1.PNG';
groundObstacleImage.onload = () => {
    groundImageLoaded = true;  
};

function spawnObstacle() {
    let size = Math.random() * 50 + 40;
    let isAirObstacle = Math.random() < 0.5;
    let airOrGroundY = isAirObstacle ? canvas.height - size - 120 : canvas.height - size;

    obstacles.push({
        x: canvas.width,
        y: airOrGroundY,
        width: size,
        height: size,
        speed: gameSpeed,
        isAirObstacle,
        initialY: airOrGroundY, 
        angle: Math.random() * Math.PI * 2, 
        diagonalDirection: Math.random() < 0.5 ? 1 : -1 
    });
}

// Helper function to draw obstacles
function drawObstacle(obs) {
    if (obs.isAirObstacle) {
        if (ghostImageLoaded) {
            ctx.drawImage(ghostImage, obs.x, obs.y, obs.width, obs.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
    } else {
        if (groundImageLoaded) {
            ctx.drawImage(groundObstacleImage, obs.x, obs.y, obs.width, obs.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
    }
}

function updateObstacles(deltaTime) {
    if (obstacles.length === 0) return;

    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= obs.speed * deltaTime;

        // Apply flying obstacle movement if it's an air obstacle
        if (obs.isAirObstacle) {
            obs.y = obs.initialY + Math.sin(obs.angle) * 20;
            obs.angle += 0.05;
            obs.y += obs.diagonalDirection * 0.5;
        }

        // Remove obstacles that move off-screen
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            i--;
        }

        // Draw the obstacle
        drawObstacle(obs);
    }
}

function detectCollision() {
    for (let obs of obstacles) {
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
