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