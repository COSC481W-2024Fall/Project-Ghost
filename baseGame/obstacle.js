import { dino } from '/baseGame/dino.js';
import { setGameOver, setPaused, setGameStarted, canvas, ctx, gameSpeed } from '/baseGame/game.js';
import { checkHighScore } from '/baseGame/score.js';

let obstacles = [];
let ghostImageLoaded = false;  
let groundImageLoaded = false;  

// Load images
const ghostImage = new Image();
ghostImage.src = '/baseGame/assets/ghost_2.png';
ghostImage.onload = () => {
    ghostImageLoaded = true;  
};

const groundObstacleImage = new Image();
groundObstacleImage.src = '/baseGame/assets/tombstone_1.png';
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
        // Draw the circular hitbox for debugging
        const centerX = obs.x + obs.width / 2;
        const centerY = obs.y + obs.height / 2;
        const radius = Math.min(obs.width, obs.height) / 2;

        // Set the style for the hitbox circle
        ctx.strokeStyle = 'red'; 
        ctx.lineWidth = 2; // Make the line width visible

        // Draw the circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
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
            obs.y = obs.initialY + Math.sin(obs.angle) * 20; //change this for sine wave (increase for bigger movement)
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
    const dinoHitbox = dino.hitbox;

    for (let obs of obstacles) {
        if (obs.isAirObstacle) {


            // Circular hitbox for ghost obstacle 
            const centerX = obs.x + obs.width / 2;
            const centerY = obs.y + obs.height / 2;
            const radius = Math.min(obs.width, obs.height) / 2;
            

            // Calculate the closest point on the dino's rectangular hitbox to the circle's center
            const closestX = Math.max(dinoHitbox.x, Math.min(centerX, dinoHitbox.x + dinoHitbox.width));
            const closestY = Math.max(dinoHitbox.y, Math.min(centerY, dinoHitbox.y + dinoHitbox.height));

            // Calculate the distance between the closest point and the circle's center
            const distanceX = centerX - closestX;
            const distanceY = centerY - closestY;
            const distanceSquared = distanceX * distanceX + distanceY * distanceY;

            // Check for collision
            if (distanceSquared < radius * radius) {
                console.log("Collision detected with ghost");
                setGameOver(true);
                setPaused(true);
                setGameStarted(false);
                checkHighScore();
            }
        } else {
            // Rectangular hitbox for ground obstacles
            if (
                dinoHitbox.x < obs.x + obs.width &&
                dinoHitbox.x + dinoHitbox.width > obs.x &&
                dinoHitbox.y < obs.y + obs.height &&
                dinoHitbox.y + dinoHitbox.height > obs.y
            ) {
                console.log("Collision detected with ground obstacle");
                setGameOver(true);
                setPaused(true);
                setGameStarted(false);
                checkHighScore();
            }
        }
    }
}



export { spawnObstacle, updateObstacles, detectCollision, obstacles };
