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
        } else {          
           gameLoop();
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
            console.log("Game Paused");
        } else {
            console.log("Game Resumed");
            startGameLoop();  // Continue the game loop if unpaused
        }
    }
});

document.getElementById('helloButton').addEventListener('click', () => {
    alert('Hello!');
});

// Event listeners for title screen buttons
playButton.addEventListener('click', () => {
    // Start the game
    hideAllScreens();
    setPaused(false);  // Unpause the game
    setGameStarted(true);  // Mark the game as started
    gameLoop();  // Start the game loop
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

export { displayText };
