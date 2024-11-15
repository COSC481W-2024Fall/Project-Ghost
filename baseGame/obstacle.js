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

class AirObstacle {
    imageLoaded;
    isAirObstacle = true;
    width;
    height;
    size;
    speed;
    x;
    y;
    initialY;
    angle;
    diagonalDirection;

    constructor(size) {
        this.imageLoaded = ghostImageLoaded;

        this.width = (this.imageLoaded ? ghostImage.width : 46) * size;
        this.height = (this.imageLoaded ? ghostImage.height : 33) * size;
        this.size = size;
        this.speed = gameSpeed;
        this.x = canvas.width;
        this.y = canvas.height - this.height - 120;

        this.initialY = this.y;
        this.angle = Math.random() * Math.PI * 2;
        this.diagonalDirection = Math.random() < 0.5 ? 1 : -1;
    }

    draw(deltaTime) {
        if (this.imageLoaded) {
            ctx.drawImage(ghostImage, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        this.x -= this.speed * deltaTime;
        this.angle += 0.05;
        this.y = this.initialY + Math.sin(this.angle) * 20; //change this for sine wave (increase for bigger movement)
        this.y += this.diagonalDirection * 0.5;
    }

    detectCollision() {
        // Circular hitbox for ghost obstacle 
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const radius = Math.min(this.width, this.height) / 2;

        // Calculate the closest point on the dino's rectangular hitbox to the circle's center
        const closestX = Math.max(dino.hitbox.x, Math.min(centerX, dino.hitbox.x + dino.hitbox.width));
        const closestY = Math.max(dino.hitbox.y, Math.min(centerY, dino.hitbox.y + dino.hitbox.height));

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
    }
}

class GroundObstacle {
    imageLoaded;
    isAirObstacle = false;
    width;
    height;
    size;
    speed;
    x;
    y;

    constructor(size) {
        this.imageLoaded = groundImageLoaded;

        this.width = (this.imageLoaded ? groundObstacleImage.width : 28) * size;
        this.height = (this.imageLoaded ? groundObstacleImage.height : 34) * size;
        this.size = size;
        this.speed = gameSpeed;
        this.x = canvas.width;
        this.y = canvas.height - this.height;
    }

    draw(deltaTime) {
        if (this.imageLoaded) {
            ctx.drawImage(groundObstacleImage, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        this.x -= this.speed * deltaTime;
    }

    detectCollision() {
        if (
            dino.hitbox.x < this.x + this.width &&
            dino.hitbox.x + dino.hitbox.width > this.x &&
            dino.hitbox.y < this.y + this.height &&
            dino.hitbox.y + dino.hitbox.height > this.y
        ) {
            console.log("Collision detected with ground obstacle");
            setGameOver(true);
            setPaused(true);
            setGameStarted(false);
            checkHighScore();
        }
    }
}

function spawnObstacle() {
    const size = Math.random() + 2;
    if (Math.random() < 0.5) {
        obstacles.push(new GroundObstacle(size))
    } else {
        obstacles.push(new AirObstacle(size))
    }
}

function updateObstacles(deltaTime) {
    if (obstacles.length === 0) return;

    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.draw(deltaTime);
        obs.detectCollision();

        // Remove obstacles that move off-screen
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            i--;
        }
    }
}

export { spawnObstacle, updateObstacles, obstacles };
