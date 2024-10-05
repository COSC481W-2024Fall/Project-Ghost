const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// const serverUrl = 'http://45.83.107.132:5000/project_ghost/';
const serverUrl = 'http://localhost:5000/project_ghost/';
const level_seed = Math.floor(Date.now() / 1000)

// Game settings
let gameSpeed = 5;
let gravity = 0.4;
let isPaused = true; // Game starts paused (until "T" is pressed)
let gameStarted = false; // Tracks whether the game has started
let gameOver = false; // Tracks if the game is over

let gameScore = 0;

// Dino player
const dino = {
	x: 50,
	y: canvas.height - 50, // Start on the ground
	width: 30,
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

// Create randomized level chunks with structured variation
function generateLevelChunks() {
	let levelChunks = [];
	
	for (let i = 0; i < 10; i++) {
		let chunk = [];
		
		// Determine if the chunk will have an elevated floor (40% chance)
		let elevated = Math.random() < 0.4;
		let elevationHeight = elevated ? Math.random() * 50 + 30 : 0; // Random elevation between 50-80
		
		// Each chunk will have between 2-5 obstacles
		let numberOfObstacles = Math.floor(Math.random() * 4) + 2;
		
		for (let j = 0; j < numberOfObstacles; j++) {
			let size = Math.random() * 30 + 20; // Random obstacle size
			let gap = Math.random() * 50 + 300; // Random distance between obstacles
			let x = j * 400 + gap + canvas.width; // Randomized obstacle placement in the chunk
			
			// Randomly determine if the obstacle is in the air or on the ground (50% chance)
			let isAirObstacle = Math.random() > 0.5;
			
			let y;
			if (isAirObstacle) {
				// Set obstacle height in the air, randomizing the Y position within a defined range
				const AIR_MIN_Y = 350;  // Minimum Y position for air obstacles
				const AIR_MAX_Y = 375;  // Maximum Y position for air obstacles
				y = AIR_MIN_Y + Math.random() * (AIR_MAX_Y - AIR_MIN_Y);
			} else {
				// Set obstacle height on the ground or elevated floor
				y = elevated ? canvas.height - size - elevationHeight : canvas.height - size;
			}
			
			// Create obstacle and add it to the chunk
			chunk.push({
				x: x,
				y: y,
				width: size,
				height: size,
				speed: gameSpeed
			});
		}
		
		levelChunks.push(chunk);
	}
	
	return levelChunks;
}

// Example usage of level chunks
let levelChunks = generateLevelChunks();
let currentChunkIndex = 0;

function updateLevelChunks() {
	// If the current chunk's obstacles are all gone, load the next chunk
	if (obstacles.length === 0) {
		// Reset to first chunk if we've cycled through all
		if (currentChunkIndex >= levelChunks.length) {
			currentChunkIndex = 0;
			levelChunks = generateLevelChunks(); // Optionally generate new random chunks
		}
		
		obstacles = levelChunks[currentChunkIndex];
		currentChunkIndex++;
	}
	
	updateObstacles();
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
	if (!gameOver && !isPaused) {
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

		if (frame % 10 === 0) gameScore++;
		displayText("Score: " + gameScore, 24, 'black', 20, 20);
		frame++;
	} else if (gameOver) {
		displayText("Game Over! Press 'R' to Restart", 30, 'red', canvas.width / 4, canvas.height / 2);
	}
	requestAnimationFrame(gameLoop);
}

// Adding a score to the database
function addScore(in_user_name, in_score, in_categories) {
	const data = {
		user_name: in_user_name,
		score: in_score,
		timestamp: level_seed,
		categories: in_categories,
	}
	const url = `${serverUrl}scores/add`
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
	.then(response => response.json());
}

// Get scores from the database
function getScores(category, limit = null) {
	let url = `${serverUrl}scores/get?category=${category}`
	if (limit !== null) {
		url += "&max=" + limit
	}
	return fetch(url)
	.then(response => response.json());
}

// Remove score from the database
function removeScore(in_category, in_score_id) {
	let url = `${serverUrl}scores/delete?category=${in_category}&score_id=${in_score_id}`;
	return fetch(url, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(response => response.json());
}

// Reset a table completely (DEV USE ONLY!!! ONLY RUN FROM CONSOLE!!!)
async function resetScores(in_category) {
	const input = prompt(`Really reset ${in_category} scores?\nEnter Y to continue:`)
	if (input != "y") {
		console.log("cancelled");
		return;
	};
	const scores = await getScores(in_category)
	if (scores['error']) {
		console.log(scores);
		return;
	}
	for (const score of scores) {
		removeScore(in_category, score['id']);
	}
	console.log(`Reset ${in_category} scores`);
}

// Event listeners
document.addEventListener('keydown', async (e) => {
	if (e.code === 'Space' && !gameOver) {
		dino.jump();
	} else if (e.code === 'KeyC' && !gameOver) {
		dino.crouch(true);
	} else if (e.code === 'KeyT' && !gameStarted) {
		isPaused = false;
		gameStarted = true;
		gameLoop();
	} else if (e.code === 'KeyR' && gameOver) {
		// Restart the game
		isPaused = false;
		gameOver = false;
		obstacles = [];
		dino.y = canvas.height - dino.height;
		frame = 0;
		gameScore = 0;
	} else if (e.code == 'KeyA' && !gameOver) {
		console.log(await addScore("xX_Ghost_Xx", Math.floor(Math.random() * 1001), ["daily", "weekly"]));
	} else if (e.code == 'KeyG' && !gameOver) {
		// getScores("weekly").then(data => console.log(data));
		console.log(await getScores("weekly"))
	}
});

document.addEventListener('keyup', (e) => {
	if (e.code === 'KeyC') {
		dino.crouch(false); // Stop crouching when 'C' is released
	}
});

// Open the title screen
titleScreen();

function titleScreen() {
	displayText("Press 'T' to Start", 30, 'black', canvas.width / 4, canvas.height / 2 - 40);
	displayText("Controls:", 24, 'black', canvas.width / 4, canvas.height / 2);
	displayText("Space: Jump", 20, 'black', canvas.width / 4, canvas.height / 2 + 30);
	displayText("C: Crouch", 20, 'black', canvas.width / 4, canvas.height / 2 + 60);
	displayText("P: Pause", 20, 'black', canvas.width / 4, canvas.height / 2 + 90);
	displayText("R: Restart after Game Over", 20, 'black', canvas.width / 4, canvas.height / 2 + 120);
	displayText("A: Add test data to database", 20, 'black', canvas.width / 4, canvas.height / 2 + 150);
	displayText("G: Get data from database", 20, 'black', canvas.width / 4, canvas.height / 2 + 180);
}
