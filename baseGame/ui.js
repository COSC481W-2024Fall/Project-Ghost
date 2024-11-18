import { dino } from '/baseGame/dino.js';
import { 
    getGameOver,
    getPaused, setPaused, 
    getGameStarted, setGameStarted, 
    canvas, ctx, startGameLoop,gameLoop, stopGameLoop, resetGame, getNameEnter, setNameEnter 
} from '/baseGame/game.js';

import { getScores, displayLeaderboard } from '/baseGame/score.js';

function displayText(text, fontSize = 20, color = 'black', x = 0, y = 0) {
    ctx.font = `${fontSize}px "Single Day"`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

// Event listeners
document.addEventListener("DOMContentLoaded", function() {
    // Resize and initial load handlers
    window.addEventListener("resize", updateControlsVisibility);
    document.addEventListener("DOMContentLoaded", updateControlsVisibility);

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
    document.getElementById('jumpButton').addEventListener('touchstart', (e) => {
        if (!getGameOver()) {
            e.preventDefault();
            dino.jump(true);
        }
    });

    document.getElementById('jumpButton').addEventListener('touchend', (e) => {
        if (!getGameOver()) {
            e.preventDefault();
            dino.jump(false);
        }
    });

    document.getElementById('crouchButton').addEventListener('touchstart', (e) => {
        if (!getGameOver()) {
            e.preventDefault();
            dino.crouch(true);
        }
    });

    document.getElementById('crouchButton').addEventListener('touchend', (e) => {
        e.preventDefault();
        dino.crouch(false);
    });

    document.getElementById('startButton').addEventListener('click', () => {
        document.getElementById("gameScreen").style.display = "flex"; // Show game screen
        updateControlsVisibility(); // Ensure controls are shown
        if (!getGameStarted()) {
            //resetGame(); // Reset before starting
            setPaused(false);  // Unpause the game
            setGameStarted(true);  // Mark the game as started
            displayScreen('game');  // Display the game screen
            startGameLoop();  // Start the game loop
        }
    });

    document.getElementById('restartButton').addEventListener('click', () => {
        document.getElementById("gameScreen").style.display = "flex"; // Show game screen
        updateControlsVisibility(); // Ensure controls are shown
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

    document.getElementById('pauseButton').addEventListener('click', () => {
        if (!getGameOver() && getGameStarted()) {
            let pausedState = getPaused();
            setPaused(!pausedState);
            if (!pausedState) {
                stopGameLoop();  // Stop the game loop if paused
                document.getElementById('pauseScreen').style.display = 'flex';  // Show overlay
                document.getElementById("gameScreen").style.display = "none"; // Hide game screen
                updateControlsVisibility();

            } else {
                gameLoop();  // Continue the game loop if unpaused
                document.getElementById('pauseScreen').style.display = 'none';  // Hide overlay
                document.getElementById("gameScreen").style.display = "flex"; // Show game screen
                updateControlsVisibility();
            }
        }
    });

    document.getElementById('resumeButton').addEventListener('click', () => {
        ResumeGame();
        document.getElementById('pauseScreen').style.display = 'none';  // Hide overlay
        document.getElementById("gameScreen").style.display = "flex"; // Show game screen
        updateControlsVisibility();
    });

    document.getElementById('instructionsButton').addEventListener('click', () => {
        displayScreen('instructionsScreen');
        document.getElementById("gameScreen").style.display = "none"; // Hide game screen
        updateControlsVisibility(); // Update controls visibility
        
    });

    document.getElementById('mainMenuButton').addEventListener('click', () => {
        displayScreen('titleOverlay')
        document.getElementById('mainMenuButton').style.display = 'none';
        document.getElementById('instructionsScreen').style.display = 'none';
        document.getElementById("gameScreen").style.display = "none"; // Hide game screen
        updateControlsVisibility(); // Update controls visibility
    });

    document.getElementById('leaderboardButton').addEventListener('click', () => {
        document.getElementById("gameScreen").style.display = "none"; // Hide game screen
        document.getElementById('leaderboardScreen').style.display = 'block'; // Show the leaderboard screen
        updateControlsVisibility(); // Update controls visibility
        displayScreen('leaderboardScreen');  // Display the leaderboard screen
        initializeLeaderboard();
        displayLeaderboard(category);
        updateLeaderboard();
    });

});

function ResumeGame(){
    if (!getGameOver() && getGameStarted()) {
        let pausedState = getPaused();
        setPaused(!pausedState);
        if (!pausedState) {
            stopGameLoop();  // Stop the game loop if paused
            document.getElementById('pauseScreen').style.display = 'flex';  // Show overlay
        } else {
            gameLoop();  // Continue the game loop if unpaused
            document.getElementById('pauseScreen').style.display = 'none';  // Hide overlay
        }
    }
}

function displayInstructionsScreen() {
    document.getElementById('instructionsScreen').style.display = 'block';
    document.getElementById('titleOverlay').style.display = 'none';
    document.getElementById('mainMenuButton').style.display = 'block';
}

function displayLeaderboardScreen() {
    initializeLeaderboard();
    displayLeaderboard(category);
    updateLeaderboard();
    document.getElementById('leaderboardScreen').style.display = 'block';
    document.getElementById('titleOverlay').style.display = 'none';
}

function displayScreen(screenType) {
    const container = document.getElementById('screenContainer');
    const ellipse = document.getElementById('ellipse');
    const titleOverlay = document.getElementById('titleOverlay');
    const gameScreen = document.getElementById('gameScreen');
    const leaderboardScreen = document.getElementById('leaderboardScreen');
    const instructionsScreen = document.getElementById('instructionsScreen');

    // Clear all existing screen classes
    container.classList.remove('gameScreen', 'titleOverlay', 'leaderboardScreen', 'instructionsScreen');

    // Add the appropriate screen class based on screenType
    switch(screenType) {
        case 'titleOverlay':
            container.classList.add('titleOverlay');
            ellipse.style.display = 'block';  // Show the ellipse
            titleOverlay.style.display = 'block';  // Show Title overlay
            updateControlsVisibility();
            displayText("Project Ghost!", 68, 'white', canvas.width / 3.9, canvas.height / 2 - 100);
           
            break;
        case 'game':
            container.classList.add('gameScreen');
            gameScreen.style.display = 'flex';  // Show overlay
            ellipse.style.display = 'none';  // Hide the ellipse
            titleOverlay.style.display = 'none';  // Hide Title overlay
            break;
        case 'instructionsScreen':
            container.classList.add('instructionsScreen');
            displayInstructionsScreen();
            instructionsScreen.style.display = 'block';  // Show overlay
            ellipse.style.display = 'none';  // Hide the ellipse
            titleOverlay.style.display = 'none';  // Hide Title overlay
            break;
        case 'leaderboard':
            container.classList.add('leaderboardScreen');
            displayLeaderboardScreen();
            ellipse.style.display = 'none';  // Hide the ellipse
            titleOverlay.style.display = 'none';  // Hide Title overlay
            
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

// Function to check screen size and active screen
function updateControlsVisibility() {
    const isSmallScreen = window.innerWidth <= 1280;
    const gameScreenVisible = document.getElementById("gameScreen").style.display === "flex";

    // Show controls only if it's a small screen and the game screen is visible
    controls.style.display = isSmallScreen && gameScreenVisible ? "flex" : "none";
}

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

export { displayText, displayScreen, updateControlsVisibility };
