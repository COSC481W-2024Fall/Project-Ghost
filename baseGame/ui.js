import { dino } from '/baseGame/dino.js';
import { obstacles } from '/baseGame/obstacle.js';
import { 
    getGameOver, setGameOver, 
    getPaused, setPaused, 
    getGameStarted, setGameStarted, 
    getGameScore, setGameScore, 
    getFrame, setFrame,
    getGameSpeed, setGameSpeed,
    canvas, ctx, startGameLoop,gameLoop, stopGameLoop, resetGame, getNameEnter, setNameEnter 
} from '/baseGame/game.js';

import { addScore, getScores } from '/baseGame/score.js';

function displayText(text, fontSize = 20, color = 'black', x = 0, y = 0) {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

// Event listeners
document.addEventListener('keydown', async (e) => {
    if (e.code === 'Space' && !getGameOver()) {
        dino.jump();
    } else if (e.code === 'KeyC' && !getGameOver()) {
        dino.crouch(true);
    } else  if (e.code === 'KeyT' && !getGameStarted()) {
        setPaused(false);  // Unpause the game
        setGameStarted(true);  // Mark the game as started
      //  resetGame();  // Reset the game before starting
        startGameLoop();  // Start the game loop
    }  else if (e.code === 'KeyR' && getGameOver() && !getNameEnter()) {
		resetGame(); // Reset before starting
        setPaused(false);  // Unpause the game
        setGameStarted(true);  // Mark the game as started
        startGameLoop();  // Start the game loop
        // Remove the score input if it exists
        let scoreInput = document.getElementById("scoreInput");
        if (scoreInput) {
            scoreInput.remove();
        }
    } else if (e.code === 'KeyP' && !getGameOver() && getGameStarted()) {
        // Toggle pause
		console.log("Paused State: ", getPaused());
        console.log("Game Over State: ", getGameOver());
        let pausedState = getPaused();
        setPaused(!pausedState);  
        if (!pausedState) {
            document.getElementById('pauseScreen').style.display = 'flex';  // Show overlay
        } else {          
            gameLoop();
            document.getElementById('pauseScreen').style.display = 'none';  // Hide overlay
        }
	 }  else if (e.code === 'KeyA' && !getGameOver()) {
        console.log(await addScore("xX_Ghost_Xx", Math.floor(Math.random() * 1001), "weekly"));
    }   else if (e.code === 'KeyG' && !getGameOver()) {
        console.log(await getScores("weekly"));
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyC') {
        dino.crouch(false);  // Stop crouching when 'C' is released
    }
});

// Button event listeners for Play screen
document.getElementById('jumpButton').addEventListener('click', () => {
    if (!getGameOver()) {
        dino.jump();
		

    }
});

document.getElementById('crouchButton').addEventListener('mousedown', () => {
    if (!getGameOver()) {
        dino.crouch(true);
    }
});

document.getElementById('crouchButton').addEventListener('mouseup', () => {
    dino.crouch(false);
});

document.getElementById('startButton').addEventListener('click', () => {
    if (!getGameStarted()) {
        //resetGame(); // Reset before starting
        setPaused(false);  // Unpause the game
        setGameStarted(true);  // Mark the game as started
        startGameLoop();  // Start the game loop
    }
});

document.getElementById('restartButton').addEventListener('click', () => {
    if (getGameOver()) {
        resetGame(); // Reset before starting
        setPaused(false);  // Unpause the game
        setGameStarted(true);  // Mark the game as started
        startGameLoop();  // Start the game loop

        let scoreInput = document.getElementById("scoreInput");
        if (scoreInput) {
            scoreInput.remove();
        }
    }
});

document.getElementById('pauseButton').addEventListener('click', () => {
    if (!getGameOver() && getGameStarted()) {
        let pausedState = getPaused();
        setPaused(!pausedState);
		console.log("Paused State: ", getPaused());
        console.log("Game Over State: ", getGameOver());
        if (!pausedState) {
            stopGameLoop();  // Stop the game loop if paused
            document.getElementById('pauseScreen').style.display = 'flex';  // Show overlay
            console.log("Game Paused");
        } else {
            console.log("Game Resumed");
            startGameLoop();  // Continue the game loop if unpaused
            document.getElementById('pauseScreen').style.display = 'none';  // Hide overlay
        }
    }
});

function displayScreen(screenType) {
    const container = document.getElementById('screenContainer');

    // Clear all existing screen classes
    container.classList.remove('titleScreen', 'diedGloriouslyScreen', 'highScoreScreen');

    // Add the appropriate screen class based on screenType
    switch(screenType) {
        case 'title':
            container.classList.add('titleScreen');
            displayTitleScreen();
            break;
        case 'diedGloriously':
            container.classList.add('diedGloriouslyScreen');
            displayDiedGloriouslyScreen();
            break;
        case 'highScore':
            container.classList.add('highScoreScreen');
            displayHighScoreScreen();
            break;
        default:
            console.log("Unknown screen type");
    }
}

// Title screen content
function displayTitleScreen() {
    displayText("Project Ghost!", 68, 'black', canvas.width / 4.5, canvas.height / 2 - 100);
    displayText("Controls:", 24, 'black', canvas.width / 2.5, canvas.height / 2 - 10);
    displayText("Press Start Button or 'T' to Start", 20, 'black', canvas.width / 4.5, canvas.height / 2 + 30);
    displayText("Press Jump Button or 'Space Bar' to Jump", 20, 'black', canvas.width / 4.5, canvas.height / 2 + 60);
    displayText("Press Crouch Button or C to Crouch", 20, 'black', canvas.width / 4.5, canvas.height / 2 + 90);
    displayText("Press Pause Button or 'P' to Pause", 20, 'black', canvas.width / 4.5, canvas.height / 2 + 120);
    displayText("Press Restart Button or 'R' after Game Over", 20, 'black', canvas.width / 4.5, canvas.height / 2 + 150);
}

// Died gloriously screen content
function displayDiedGloriouslyScreen() {

}

// High score screen content
function displayHighScoreScreen() {

}

// On start use title screen
displayScreen('title');
// You can call displayScreen('whatever') depending on the game state

/**
 * Author: Connor Spears
 * Date: 10/23/2024
 * Description: Activate or deactivate the leaderboard, and build the leaderboard based on which leaderboard you placed in to
 * @param {boolean} active should the leaderboard be turned on or off? 
 * @param {string} type which leaderboard should be displayed
 */
export async function displayLeaderboard(active, type){
    if(active){
        let leaderboard = document.createElement("table");
        leaderboard.id = "leaderboard";
        leaderboard.innerHTML += `<h2>${type}</h2>`;
        let scoreList = await getScores(type);
        scoreList.forEach((score, index) => {
            //TODO: New high score does not show up when loading the leaderboard (sync issue?)
            leaderboard.innerHTML += `<tr><td>${index + 1}</td><td>${score.user_name}</td><td>${score.score}</td></tr>`;
        });
        document.body.appendChild(leaderboard);
    }else{
        document.querySelector("#leaderboard").remove();
    }
}

export { displayText };
