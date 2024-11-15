import { dino } from '/baseGame/dino.js';
import { setGameOver, setPaused, setGameStarted, canvas, ctx, gameSpeed, levelSeed } from '/baseGame/game.js';
import { checkHighScore } from '/baseGame/score.js';
import { SeededRandom } from '/baseGame/seededRandom.js';

let obstacles = [];
let ghostImageLoaded = false;
let groundImageLoaded = false;
let rng = false;

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
    static inARow = 0;
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

        this.width = ((this.imageLoaded ? ghostImage.width : 46) * size) * 0.7;
        this.height = ((this.imageLoaded ? ghostImage.height : 33) * size) * 0.7;
        this.size = size;
        this.speed = gameSpeed;
        this.x = canvas.width;
        this.y = canvas.height - this.height - 100;

        this.initialY = this.y;
        this.angle = rng.newFloat() * Math.PI * 2;
        this.diagonalDirection = rng.newFloat() < 0.5 ? 1 : -1;
    }

    draw(deltaTime) {
        if (this.imageLoaded) {
            ctx.drawImage(ghostImage, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        this.x -= this.speed * deltaTime;
        this.angle += (0.002 * this.speed); // speed of vertical movement
        this.y = this.initialY + Math.sin(this.angle) * 80; //change this for sine wave (increase for bigger movement)
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
            console.log("Level seed:", levelSeed);
        }
    }
}

class GroundObstacle {
    static inARow = 0;
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
            console.log("Level seed:", levelSeed);
        }
    }
}

const obstacleTypes = [AirObstacle, GroundObstacle]

function spawnObstacle() {
    if (!rng) {
        rng = new SeededRandom(levelSeed);
    }
    const size = rng.newFloat() + 2;
    const obsIndex = rng.newInt(0, obstacleTypes.length)
    let ObsType = obstacleTypes[obsIndex];

    while(!checkInARow(ObsType)) {
        ObsType = obstacleTypes[(obsIndex + 1) % obstacleTypes.length];
        console.log("in loop")
    }

    obstacles.push(new ObsType(size));
}

function checkInARow(ObstacleType) {
    // max of same obstacles that can appear in a row
    if(ObstacleType.inARow >= 5) return false;

    // Decrease all other obstacle in a rows by one
    for(let OtherType of obstacleTypes) {
        if(OtherType === ObstacleType) continue;
        if(OtherType.inARow > 0) OtherType.inARow -= 1;
    }

    ObstacleType.inARow += 1;
    return true;
}

function updateObstacles(deltaTime) {
    if (obstacles.length === 0) return;

    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.draw(deltaTime);
        // obs.detectCollision();

        // Remove obstacles that move off-screen
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            i--;
        }
    }
}

export { spawnObstacle, updateObstacles, obstacles };
