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
    ctx.font = `${fontSize}px "Single Day"`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

// Event listeners
document.addEventListener('keydown', async (e) => {
    if (e.code === 'Space' && !getGameOver()) {
        dino.jump();
    } else if (e.code === 'KeyC' && !getGameOver()) {
        dino.crouch(true);
    } else if (e.code === 'KeyT' && !getGameStarted()) {
        setPaused(false);  // Unpause the game
        setGameStarted(true);  // Mark the game as started
        document.getElementById('ellipse').style.display = 'none';
        startGameLoop();  // Start the game loop
    } else if (e.code === 'KeyR' && getGameOver()) {
        if (!getNameEnter()) {
            resetGame(); // Reset before starting
            setPaused(false);  // Unpause the game
            setGameStarted(true);  // Mark the game as started
            startGameLoop();  // Start the game loop
            let scoreInput = document.getElementById("scoreInput");
            if (scoreInput) {
                scoreInput.remove();
            }
        } else {
            alert("You cannot reset the game while entering your name for the leaderboard.");
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
    } else if (e.code === 'KeyA' && !getGameOver()) {
        console.log(await addScore("xX_Ghost_Xx", Math.floor(Math.random() * 1001), "weekly"));
    } else if (e.code === 'KeyG' && !getGameOver()) {
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
        document.getElementById('ellipse').style.display = 'none'; 
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

function displayTitleScreen() {
    const ellipse = document.getElementById('ellipse');
    ellipse.style.display = 'block'; // Show the ellipse

    displayText("Project Ghost!", 68, 'white', canvas.width / 4.0, canvas.height / 2 - 100);
    displayText("Controls:", 24, 'black', canvas.width / 2.4, canvas.height / 2 - 10);
    displayText("Press Start Button or 'T' to Start", 20, 'black', canvas.width / 4.0, canvas.height / 2 + 30);
    displayText("Press Jump Button or 'Space Bar' to Jump", 20, 'black', canvas.width / 4.0, canvas.height / 2 + 60);
    displayText("Press Crouch Button or C to Crouch", 20, 'black', canvas.width / 4.0, canvas.height / 2 + 90);
    displayText("Press Pause Button or 'P' to Pause", 20, 'black', canvas.width / 4.0, canvas.height / 2 + 120);
    displayText("Press Restart Button or 'R' after Game Over", 20, 'black', canvas.width / 4.0, canvas.height / 2 + 150);
}

function displayScreen(screenType) {
    const container = document.getElementById('screenContainer');
    const ellipse = document.getElementById('ellipse');

    // Clear all existing screen classes
    container.classList.remove('titleScreen', 'highScoreScreen');

    // Add the appropriate screen class based on screenType
    switch(screenType) {
        case 'title':
            container.classList.add('titleScreen');
            displayTitleScreen();
            ellipse.style.display = 'block';  // Show the ellipse
            break;
        case 'highScore':
            container.classList.add('highScoreScreen');
            displayHighScoreScreen();
            ellipse.style.display = 'none';  // Hide the ellipse
            break;
        default:
            console.log("Unknown screen type");
            ellipse.style.display = 'none';  // Hide the ellipse
    }
}

// On start use title screen
displayScreen('title');

/**
 * Author: Connor Spears
 * Date: 10/26/2024
 * Description: Create the leaderboard which will be dynamically filled later
 */
export async function initializeLeaderboard(){
    const container = document.createElement("div");
    container.id = "leaderboardContainer";

    const buttonsContainer = document.createElement("div");

    //Buttons must be created this way so they can access the updateLeaderboard function
    const dailyButton = document.createElement("button");
    dailyButton.textContent = "Daily";
    dailyButton.addEventListener("click", async () => await updateLeaderboard("daily"));

    const weeklyButton = document.createElement("button");
    weeklyButton.textContent = "Weekly";
    weeklyButton.addEventListener("click", async () => await updateLeaderboard("weekly"));

    const allTimeButton = document.createElement("button");
    allTimeButton.textContent = "All Time";
    allTimeButton.addEventListener("click", async () => await updateLeaderboard("allTime"));

    buttonsContainer.append(dailyButton, weeklyButton, allTimeButton);
    container.appendChild(buttonsContainer);

    const leaderboard = document.createElement("table");
    leaderboard.id = "leaderboard";
    container.appendChild(leaderboard);

    document.body.appendChild(container);

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

export { displayText };
