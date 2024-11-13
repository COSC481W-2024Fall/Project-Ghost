import { dino } from '/baseGame/dino.js';
import { 
    getGameOver,
    getPaused, setPaused, 
    getGameStarted, setGameStarted, 
    canvas, ctx, startGameLoop,gameLoop, stopGameLoop, resetGame, getNameEnter, setNameEnter 
} from '/baseGame/game.js';

import { getScores } from '/baseGame/score.js';

function displayText(text, fontSize = 20, color = 'black', x = 0, y = 0) {
    ctx.font = `${fontSize}px "Single Day"`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

document.addEventListener("DOMContentLoaded", function() {
    // Event listeners
    document.addEventListener('keydown', async (e) => {
        if (e.code === 'Space' && !getGameOver()) {
            dino.jump(true);
        } else if (e.code === 'KeyC' && !getGameOver()) {
            dino.crouch(true);
        } else  if (e.code === 'KeyT' && !getGameStarted()) {
            setPaused(false);  // Unpause the game
            setGameStarted(true);  // Mark the game as started
            displayScreen('game');  // Display the game screen
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
        } else if (e.code === 'Escape' && !getGameOver() && getGameStarted()) {
            PauseGame()
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'KeyC') {
            dino.crouch(false);  // Stop crouching when 'C' is released
        } else if (e.code === 'Space') {
            dino.jump(false);
        }
    });

    // Button event listeners for Play screen
    document.getElementById('jumpButton').addEventListener('mousedown', () => {
        if (!getGameOver()) {
            dino.jump(true);
        }
    });

    document.getElementById('jumpButton').addEventListener('mouseup', () => {
        if (!getGameOver()) {
            dino.jump(false);
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
            displayScreen('game');  // Display the game screen
            startGameLoop();  // Start the game loop
        }
    });

    document.getElementById('restartButton').addEventListener('click', () => {
        if (getGameOver()) {
            if (!getNameEnter()) {
                resetGame(); // Reset before starting
                setPaused(false);  // Unpause the game
                setGameStarted(true);  // Mark the game as started
                displayScreen('game');  // Display the game screen
                startGameLoop();  // Start the game loop

                let scoreInput = document.getElementById("scoreInput");
                if (scoreInput) {
                    scoreInput.remove();
                }
            } else {
                alert("You cannot reset the game while entering your name for the leaderboard.");
            }
        }
    });

    document.getElementById('pauseButton').addEventListener('click', PauseGame());

    document.getElementById('resumeButton').addEventListener('click', ResumeGame());

    document.getElementById('controlsButton').addEventListener('click', () => displayScreen('controls'));
    
    document.getElementById('mainMenuButton').addEventListener('click', () => {
        displayScreen('titleOverlay')
        document.getElementById('mainMenuButton').style.display = 'none';
        document.getElementById('controlsScreen').style.display = 'none';
    });

    document.getElementById('leaderboardButton').addEventListener('click', () => {
        console.log('Leaderboard button clicked');
        document.getElementById('leaderboardScreen').style.display = 'block'; // Show the leaderboard screen
    });

});

function PauseGame(){
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
            gameLoop();  // Continue the game loop if unpaused
            document.getElementById('pauseScreen').style.display = 'none';  // Hide overlay
        }
    }
}

function ResumeGame(){
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
            gameLoop();  // Continue the game loop if unpaused
            document.getElementById('pauseScreen').style.display = 'none';  // Hide overlay
        }
    }
}

function displayControlsScreen() {
    document.getElementById('controlsScreen').style.display = 'flex';
    document.getElementById('titleOverlay').style.display = 'none';
    displayText("Controls:", 24, 'white', canvas.width / 2.4, canvas.height / 2 - 10);
    displayText("Press 'T' or Start Button to Start", 20, 'white', canvas.width / 4.0, canvas.height / 2 + 30);
    displayText("Press 'Space Bar' or Jump Button to Jump", 20, 'white', canvas.width / 4.0, canvas.height / 2 + 60);
    displayText("Press 'C' or Crouch Button to Crouch", 20, 'white', canvas.width / 4.0, canvas.height / 2 + 90);
    displayText("Press 'P' or Pause Button to Pause", 20, 'white', canvas.width / 4.0, canvas.height / 2 + 120);
    displayText("Press 'R' or Restart Button after Game Over", 20, 'white', canvas.width / 4.0, canvas.height / 2 + 150);
    document.getElementById('mainMenuButton').style.display = 'block';
}

function displayScreen(screenType) {
    const container = document.getElementById('screenContainer');
    const ellipse = document.getElementById('ellipse');
    const titleOverlay = document.getElementById('titleOverlay');
    const gameScreen = document.getElementById('gameScreen');

    // Clear all existing screen classes
    container.classList.remove('gameScreen', 'titleOverlay', 'leaderboardScreen', 'controlsScreen');

    // Add the appropriate screen class based on screenType
    switch(screenType) {
        case 'titleOverlay':
            container.classList.add('titleOverlay');
            ellipse.style.display = 'block';  // Show the ellipse
            titleOverlay.style.display = 'block';  // Show Title overlay
            displayText("Project Ghost!", 68, 'white', canvas.width / 3.9, canvas.height / 2 - 100);
            break;
        case 'game':
            container.classList.add('gameScreen');
            gameScreen.style.display = 'flex';  // Show overlay
            ellipse.style.display = 'none';  // Hide the ellipse
            titleOverlay.style.display = 'none';  // Hide Title overlay
            break;
        case 'leaderboard':
            container.classList.add('leaderboardScreen');
            displayLeaderboardScreen();
            ellipse.style.display = 'none';  // Hide the ellipse
            titleOverlay.style.display = 'none';  // Hide Title overlay
            break;
        case 'controls':
            container.classList.add('controlsScreen');
            displayControlsScreen();
            ellipse.style.display = 'none';
            titleOverlay.style.display = 'none';
            break;
        default:
            console.log("Unknown screen type");
            ellipse.style.display = 'none';  // Hide the ellipse
            titleOverlay.style.display = 'none';  // Hide Title overlay
            break;
    }
}

// On start use this screen
displayScreen('titleOverlay');

/**
 * Author: Connor Spears
 * Date: 10/26/2024
 * Description: Create the leaderboard which will be dynamically filled later
 */
export async function initializeLeaderboard(){
    const container = document.querySelector("#leaderboardScreen");

    const buttonsContainer = document.createElement("div");
    buttonsContainer.id = "buttonsContainer"; // Assign an ID

    //Buttons must be created this way so they can access the updateLeaderboard function
    const dailyButton = document.createElement("button");
    dailyButton.textContent = "Daily";
    dailyButton.id = "dailyLeaderboardButton"; // Assign an ID
    dailyButton.addEventListener("click", async () => await updateLeaderboard("daily"));

    const weeklyButton = document.createElement("button");
    weeklyButton.textContent = "Weekly";
    weeklyButton.id = "weeklyLeaderboardButton"; // Assign an ID
    weeklyButton.addEventListener("click", async () => await updateLeaderboard("weekly"));

    const allTimeButton = document.createElement("button");
    allTimeButton.textContent = "All Time";
    allTimeButton.id = "allTimeLeaderboardButton"; // Assign an ID
    allTimeButton.addEventListener("click", async () => await updateLeaderboard("allTime"));

    buttonsContainer.append(dailyButton, weeklyButton, allTimeButton);
    container.appendChild(buttonsContainer);

    const leaderboard = document.createElement("table");
    leaderboard.id = "leaderboard";
    container.appendChild(leaderboard);

    container.setAttribute('style', 'display: block;');

    await updateLeaderboard("daily");
}

/**
 * Author: Connor Spears
 * Date: 10/26/2024
 * Description: Fill dynamically created table with scores of the desired type
 * @param {string} type 
 */
export async function updateLeaderboard(type){
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML=`<h2>${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard</h2>`;

    const scoreList = await getScores(type);

    leaderboard.innerHTML += `
        <tr>
            <th class="rank-column">Rank</th>
            <th>Name</th>
            <th>Score</th>
        </tr>
    `;
    scoreList.forEach((score, index) =>{
        leaderboard.innerHTML += `
            <tr>
                <td class="rank-column">${index + 1}</td>
                <td>${score.user_name}</td>
                <td>${score.score}</td>
            </tr>
        `;
    });
}

export { displayText, displayScreen };
