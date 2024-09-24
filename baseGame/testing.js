const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
let gameSpeed = 5;
let gravity = 0.4;
let isPaused = true; // Game starts paused (until "T" is pressed)
let gameStarted = false; // Tracks whether the game has started
let gameOver = false; // Tracks if the game is over

// Dino player
const dino = {
	x: 50,
	y: canvas.height - 50, // Start on the ground
	width: 50,
	height: 50,
	dy: 0,
	jumping: false,
	crouching: false,

	draw() {
		// Keep the top fixed, and adjust height from the bottom
		const height = this.crouching ? this.height / 2 : this.height;
		const adjustedY = this.crouching ? this.y + this.height / 2 : this.y; // Adjust to fold down
		ctx.fillStyle = this.crouching ? 'blue' : 'green'; // Change color if crouching
		ctx.fillRect(this.x, adjustedY, this.width, height);
	},

	update() {
		// Apply gravity when jumping
		if (this.jumping) {
			this.dy += gravity;
			this.y += this.dy;

			// Stop at ground level
			if (this.y + this.height >= canvas.height) {
				this.y = canvas.height - this.height;
				this.dy = 0;
				this.jumping = false;
			}
		}

		// Adjust height based on crouching status
		if (!this.jumping) {
			if (this.crouching) {
				// Crouch, make the dino shorter and adjust Y position to keep it on the ground
				this.height = 25;
				this.y = canvas.height - this.height; // Keep the dino on the ground when crouching
			} else {
				// Reset the height and ensure the dino is grounded
				this.height = 50;
				this.y = canvas.height - this.height; // Ensure it's back to standing position
			}
		}
	},

	jump() {
		if (!this.jumping && !this.crouching) { // Prevent jumping mid-air and when crouching
			this.jumping = true;
			this.dy = -12; // Jump velocity
		}
	},

	crouch(state) {
		// Only allow crouching when on the ground
		if (!this.jumping) {
			this.crouching = state;
		}
	}
};

// Obstacles
let obstacles = [];
function spawnObstacle() {
	let size = Math.random() * 50 + 20;
	let airOrGround = Math.random() < 0.5 ? canvas.height - size : canvas.height - size - 40; // Sometimes in air
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
		
		// Remove off-screen obstacles
		if (obs.x + obs.width < 0) {
			obstacles.splice(i, 1);
			i--;
		}
		
		// Draw obstacle
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
			// Collision detected
			gameOver = true;
			isPaused = true;
		}
	}
}

function displayText(text, fontSize, color, x, y) {
	ctx.font = `${fontSize}px Arial`;
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
}

// Game loop
let frame = 0;
function gameLoop() {
	if (!isPaused) {
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
		
		frame++;
	} else {
		if (!gameStarted) {
			// Display controls on the start screen
			displayText("Press 'T' to Start", 30, 'black', canvas.width / 4, canvas.height / 2 - 40);
			displayText("Controls:", 24, 'black', canvas.width / 4, canvas.height / 2);
			displayText("Space: Jump", 20, 'black', canvas.width / 4, canvas.height / 2 + 30);
			displayText("C: Crouch", 20, 'black', canvas.width / 4, canvas.height / 2 + 60);
			displayText("P: Pause", 20, 'black', canvas.width / 4, canvas.height / 2 + 90);
			displayText("R: Restart after Game Over", 20, 'black', canvas.width / 4, canvas.height / 2 + 120);
			displayText("H: Get Hello message from server", 20, 'black', canvas.width / 4, canvas.height / 2 + 150)
		}
		if (gameOver) {
			displayText("Game Over! Press 'R' to Restart", 30, 'red', canvas.width / 4, canvas.height / 2);
		}
	}
	
	requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
	if (e.code === 'Space' && !gameOver) {
		dino.jump();
	} else if (e.code === 'KeyC' && !gameOver) {
		dino.crouch(true);
	} else if (e.code === 'KeyT' && !gameStarted) {
		isPaused = false;
		gameStarted = true;
	} else if (e.code === 'KeyR' && gameOver) {
		// Restart the game
		isPaused = false;
		gameOver = false;
		obstacles = [];
		dino.y = canvas.height - dino.height;
		frame = 0;
	} else if (e.code == 'KeyH' && !gameOver) {
		const serverUrl = 'http://0.0.0.0:5000/project_ghost/hello_world';
		fetch(serverUrl)
		.then(response => response.json())
		.then(data => {
			displayText(data["message"], 24, 'red', canvas.width / 4, canvas.height / 2 - 80);
		})
		.catch(error => console.error('Error:', error));
	}
});

document.addEventListener('keyup', (e) => {
	if (e.code === 'KeyC') {
		dino.crouch(false); // Stop crouching when 'C' is released
	}
});

// Start the game loop
gameLoop();
