const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const serverUrl = 'http://45.83.107.132:5000/project_ghost/';
//const serverUrl = 'http://localhost:5000/project_ghost/';
const level_seed = Math.floor(Date.now() / 1000)

// Screens
const titleScreen = document.getElementById('titleScreen');
const highScoresScreen = document.getElementById('highScoresScreen');
const tutorialScreen = document.getElementById('tutorialScreen');

// Buttons
const playButton = document.getElementById('playButton');
const highScoresButton = document.getElementById('highScoresButton');
const tutorialButton = document.getElementById('tutorialButton');
const backFromScoresButton = document.getElementById('backFromScoresButton');
const backFromTutorialButton = document.getElementById('backFromTutorialButton');

// Game settings
let gameSpeed = 5;
let gravity = 0.4;
let isPaused = true; // Game starts paused (until "T" is pressed)
let gameStarted = false; // Tracks whether the game has started
let isGameOver = false; // Tracks if the game is over

let gameScore = 0;
let nameEnter = false;
const scoreCategories = ["daily", "weekly", "allTime"]

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
			if (isGameOver) { console.log("true"); } else { console.log("false");}
			isGameOver = true;
			if (isGameOver) { console.log("true"); } else { console.log("false");}
			isPaused = true;
			if (isGameOver) { console.log("true"); } else { console.log("false");}
			checkHighScore();
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

		//Increase the players score every ten frames - CS
		if (frame % 10 === 0) gameScore++;
		displayText("Score: " + gameScore, 24, 'black', 20, 20);
		frame++;
	}
	requestAnimationFrame(gameLoop);
}

/**
 * Author: Connor Spears
 * Date: 10/6/2024
 * Description: Evaluates the player's score to see if they should be placed on any leaderboard, then enters it to the database
 * Function: checkHighScore
 */
async function checkHighScore(){
	let highString = [];
	//Check every category for the leaderboards, if the score can be entered then put it in and continue, otherwise break
	//Const can be used because it is destroyed and recreated at the beginning of the next loop
	for(const category of scoreCategories){
		const currentCategory = await getScores(category);
		//Are there less than 10 entries in the current leaderboard? Or is the score higher than the 10th entry?
		if(currentCategory.length < 10 || gameScore > currentCategory[currentCategory.length - 1].score){
			highString.push(category);
			nameEnter = true;
			if(currentCategory.length >= 10) removeScore(category, currentCategory[currentCategory.length - 1].id);
		}else{ break; }
	}
	
	if(nameEnter){
		displayText("Made it on the leaderboard! Enter a 3-character name:")
		const playerName = await nameEntry();
		addScore(playerName, gameScore, highString);
		nameEnter = false;
	}
	displayText("Game Over! Press 'R' to Restart", 30, 'red', canvas.width / 4, canvas.height / 2);
}

/**
 * Author: Connor Spears
 * Date: 10/4/2024
 * Edited: 10/8/2024
 * Function: nameEntry
 * Description: Creates an HTML element for the user to input a 3 character name if their score is on the leaderboard
 * @returns {Promise<String>} 3 character limited String for the username}
 */
function nameEntry(){
	return new Promise((resolve) => {
		let textNode = document.createElement("p");
		textNode.textContent = "Enter your name: ";
		textNode.id = "scoreInput";
		
		let inputElement = document.createElement("input");
		inputElement.setAttribute("type", "text");
		inputElement.setAttribute("name", "playerName");
		inputElement.setAttribute("maxlength", "3");
		inputElement.style.textTransform = "uppercase";

		const regex = /^[A-Za-z0-9]*$/;
	
		let submitButton = document.createElement("button");
		submitButton.textContent = "Submit";
		
		textNode.appendChild(inputElement);
		textNode.appendChild(submitButton);
		document.body.appendChild(textNode);
	
		textNode.addEventListener("keypress", function(event){
			if(event.key === "Enter"){
				event.preventDefault();
				submitButton.dispatchEvent(new Event("click"));
			}
		});

		inputElement.addEventListener("input", function() {
            const inputValue = this.value;

            // Validate against regex and length
            if (!regex.test(inputValue)) {
                // If input doesn't match the regex, remove the last character
                this.value = inputValue.slice(0, -1);
            }
        });

		submitButton.addEventListener("click", function(event){
			event.preventDefault();
			const playerName = inputElement.value;
			if(playerName.trim().length == 3){
				resolve(playerName);
				document.body.removeChild(textNode);
			}else{
				alert("Please enter a valid name.");
			}
		});
	});
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
	if (e.code === 'Space' && !isGameOver) {
		dino.jump();
	} else if (e.code === 'KeyC' && !isGameOver) {
		dino.crouch(true);
	} else if (e.code === 'KeyT' && !gameStarted) {
		isPaused = false;
		gameStarted = true;
		gameLoop();
	} else if (e.code === 'KeyR' && isGameOver && !nameEnter) {
		// Restart the game
		isPaused = false;
		isGameOver = false;
		obstacles = [];
		dino.y = canvas.height - dino.height;
		frame = 0;
		gameScore = 0;
		let scoreInput = document.getElementById("scoreInput")
		scoreInput.remove();
	} else if (e.code == 'KeyP' && !isGameOver && gameStarted) {
		isPaused = !isPaused;
	} else if (e.code == 'KeyA' && !isGameOver) {
		console.log(await addScore("xX_Ghost_Xx", Math.floor(Math.random() * 1001), "weekly"));
	} else if (e.code == 'KeyG' && !isGameOver) { //This !isGameOver might want to be isGameOver? - CS
		// getScores("weekly").then(data => console.log(data));
		console.log(await getScores("weekly"))
	}
});

document.addEventListener('keyup', (e) => {
	if (e.code === 'KeyC') {
		dino.crouch(false); // Stop crouching when 'C' is released
	}
});

// Button event listeners for Play screen
document.getElementById('jumpButton').addEventListener('click', () => {
	if (!isGameOver) {
		dino.jump();
	}
});

document.getElementById('crouchButton').addEventListener('mousedown', () => {
	if (!isGameOver) {
		dino.crouch(true);
	}
});

document.getElementById('crouchButton').addEventListener('mouseup', () => {
	dino.crouch(false);
});

document.getElementById('startButton').addEventListener('click', () => {
	if (!gameStarted) {
		isPaused = false;
		gameStarted = true;
		gameLoop();
	}
});

document.getElementById('restartButton').addEventListener('click', () => {
	if (isGameOver) {
		isPaused = false;
		isGameOver = false;
		obstacles = [];
		dino.y = canvas.height - dino.height;
		frame = 0;
		gameScore = 0;
		let scoreInput = document.getElementById("scoreInput");
		if (scoreInput) {
			scoreInput.remove();
		}
	}
});

document.getElementById('pauseButton').addEventListener('click', () => {
	if (!isGameOver && gameStarted) {
		isPaused = !isPaused;
	}
});

document.getElementById('helloButton').addEventListener('click', () => {
	alert('Hello!');
});

// Event listeners for title screen buttons
playButton.addEventListener('click', () => {
	// Start the game
	hideAllScreens();
	isPaused = false;
	gameStarted = true;
	gameLoop(); // Start the game loop
});

highScoresButton.addEventListener('click', () => {
	// Show High Scores screen
	hideAllScreens();
	highScoresScreen.classList.remove('hidden');
	// Optionally, fetch and display high scores
	getScores('weekly').then(data => {
		let scoresText = data.map(score => `${score.user_name}: ${score.score}`).join('<br>');
		document.getElementById('highScoresList').innerHTML = scoresText;
	});
});

tutorialButton.addEventListener('click', () => {
	// Show Tutorial screen
	hideAllScreens();
	tutorialScreen.classList.remove('hidden');
});

backFromScoresButton.addEventListener('click', () => {
	// Go back to title screen from High Scores
	showTitleScreen();
});

backFromTutorialButton.addEventListener('click', () => {
	// Go back to title screen from Tutorial
	showTitleScreen();
});

// Open the title screen initially
showTitleScreen();


// Function to hide all screens
function hideAllScreens() {
	titleScreen.classList.add('hidden');
	highScoresScreen.classList.add('hidden');
	tutorialScreen.classList.add('hidden');
}

// Function to display the title screen
function showTitleScreen() {
	hideAllScreens();
	titleScreen.classList.remove('hidden');
}

// Open the title screen
displayTitleScreen();

function displayTitleScreen() {
	displayText("Press 'T' to Start", 30, 'black', canvas.width / 4, canvas.height / 2 - 40);
	displayText("Controls:", 24, 'black', canvas.width / 4, canvas.height / 2);
	displayText("Space: Jump", 20, 'black', canvas.width / 4, canvas.height / 2 + 30);
	displayText("C: Crouch", 20, 'black', canvas.width / 4, canvas.height / 2 + 60);
	displayText("P: Pause", 20, 'black', canvas.width / 4, canvas.height / 2 + 90);
	displayText("R: Restart after Game Over", 20, 'black', canvas.width / 4, canvas.height / 2 + 120);
	displayText("A: Add test data to database", 20, 'black', canvas.width / 4, canvas.height / 2 + 150);
	displayText("G: Get data from database", 20, 'black', canvas.width / 4, canvas.height / 2 + 180);
}
