import { gameScore, canvas, serverUrl, levelSeed, getNameEnter, setNameEnter, scoreCategories } from '/baseGame/game.js';
import { displayText, displayScreen, initializeLeaderboard} from '/baseGame/ui.js';
import { resetGame, setPaused, setGameStarted, startGameLoop } from './game.js';

/**
 * Author: Connor Spears
 * Date: 10/6/2024
 * Description: Evaluates the player's score to see if they should be placed on any leaderboard, then enters it to the database
 * Function: checkHighScore
 */

async function checkHighScore() {
    let highString = [];
    document.getElementById('gameScreen').style.display = 'none'; // Hide the game screen
    document.getElementById('controls').style.display = 'none';

    for (const category of scoreCategories) {
        const currentCategory = await getScores(category);
        if (currentCategory.length < 10 || gameScore > currentCategory[currentCategory.length - 1].score) {
            highString.push(category);
            setNameEnter(true);
            while(currentCategory.length >= 10){
                await removeScore(category, currentCategory[currentCategory.length - 1].id);
                currentCategory.pop();
            } 
        } else { break; }
    }

    if (getNameEnter()) {
        document.getElementById('diedWellScreen').style.display = 'block';  // Show overlay
        document.getElementById("gameScreen").style.display = "none"; // Hide game screen
        const playerName = await nameEntry();  // Call nameEntry to get the player's name
        await addScore(playerName, gameScore, highString);
        setNameEnter(false);
        await initializeLeaderboard();
        
        // After adding the score, show the leaderboard
        document.getElementById('leaderboardScreen').style.display = 'block'; // Show the leaderboard screen
    } else {
        document.getElementById('diedScreen').style.display = 'flex';  // Show overlay
        document.getElementById("gameScreen").style.display = "none";
    }
}

async function displayLeaderboard(category) {
    console.log(`Displaying leaderboard for category: ${category}`); // Debug log
    const leaderboardData = await getScores(category); // Fetch scores based on the selected category
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = ''; // Clear previous entries

    leaderboardData.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.textContent = `${entry.user_name}: ${entry.score}`;
        leaderboardList.appendChild(entryDiv);
    });

    document.getElementById('leaderboardScreen').style.display = 'block'; // Show the leaderboard screen
    document.getElementById('diedWellScreen').style.display = 'none'; // Hide the diedWellScreen
    document.getElementById('gameScreen').style.display = 'none'; // Hide the game screen
    document.getElementById('titleOverlay').style.display = 'none'; // Hide the title screen
    document.getElementById('ellipse').style.display = 'none'; // Hide the ellipse
}

// All event listeners should be inside a DOMContentLoaded event listener!
document.addEventListener("DOMContentLoaded", function() {
    // Add event listener for the mainMenuButtonFromLeaderboard From Leaderboard screen
    document.getElementById('mainMenuButtonFromLeaderboard').addEventListener('click', () => {
        document.getElementById("gameScreen").style.display = "none"; // Hide the game screen
        document.getElementById('leaderboardScreen').style.display = 'none'; // Hide leaderboard
        displayScreen('titleOverlay'); // Show the title screen
    });
});

/**
 * Author: Connor Spears
 * Date: 10/4/2024
 * Edited: 10/8/2024
 * Function: nameEntry
 * Description: Creates an HTML element for the user to input a 3 character name if their score is on the leaderboard
 * @returns {Promise<String>} 3 character limited String for the username
 */
function nameEntry() {
    return new Promise((resolve) => {
        const inputElement = document.getElementById("initialsInput");
        const submitButton = document.getElementById("submitInitialsButton");

        inputElement.focus();  // Focus on the input field
        inputElement.select(); // Select the input field

        // Clear previous input
        inputElement.value = '';

        const regex = /^[A-Za-z0-9]*$/;

        inputElement.addEventListener("input", function() {
            const inputValue = this.value;
            if (!regex.test(inputValue)) {
                this.value = inputValue.slice(0, -1);
            }
        });

        submitButton.onclick = (event) => nameSubmission(event, resolve, inputElement);
        inputElement.addEventListener('keydown', (event) => {
            if(event.key === 'Enter'){
                nameSubmission(event, resolve, inputElement);
            }
        });
    });
}

function nameSubmission(event, resolve, inputElement){
    event.preventDefault();
    const playerName = inputElement.value;
    if (playerName.trim().length === 3) {
        resolve(playerName.toUpperCase());  // Convert to uppercase before resolving
        inputElement.value = ''; // Clear the input field after submission
        document.getElementById('diedWellScreen').style.display = 'none';  // Hide overlay after submission
    } else {
        alert("Please enter a valid name.");
    }
}

// Adding a score to the database
function addScore(in_user_name, in_score, in_categories) {
	const data = {
		user_name: in_user_name,
		score: in_score,
		timestamp: levelSeed,
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
window.getScores = getScores;

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
export{checkHighScore, nameEntry, displayLeaderboard ,addScore, removeScore, getScores, resetScores};
