
import { gameScore, canvas, serverUrl, level_seed, getNameEnter, setNameEnter, scoreCategories } from '/baseGame/game.js';
import { displayText, displayLeaderboard} from '/baseGame/ui.js';

/**
 * Author: Connor Spears
 * Date: 10/6/2024
 * Description: Evaluates the player's score to see if they should be placed on any leaderboard, then enters it to the database
 * Function: checkHighScore
 */
async function checkHighScore() {
    let highString = [];
    // Check every category for the leaderboards, if the score can be entered then put it in and continue, otherwise break
	//Const can be used because it is destroyed and recreated at the beginning of the next loop
    for (const category of scoreCategories) {
        const currentCategory = await getScores(category);
        // Are there less than 10 entries in the current leaderboard? Or is the score higher than the 10th entry?
        if (currentCategory.length < 10 || gameScore > currentCategory[currentCategory.length - 1].score) {
            highString.push(category);
            setNameEnter(true); // Set nameEnter to true
            while(currentCategory.length >= 10){
                await removeScore(category, currentCategory[currentCategory.length - 1].id);
                currentCategory.pop();
            } 
        } else { break; }
    }

    if (getNameEnter()) { // Check if nameEnter is true
        displayText("Made it on the leaderboard! Enter a 3-character name:");
        const playerName = await nameEntry();
        await addScore(playerName, gameScore, highString);
        setNameEnter(false); // Reset nameEnter to false
        displayLeaderboard(true, highString.pop());
    }

    displayText("Game Over! Press 'R' to Restart", 30, 'red', canvas.width / 4, canvas.height / 2);
}

/**
 * Author: Connor Spears
 * Date: 10/4/2024
 * Edited: 10/8/2024
 * Function: nameEntry
 * Description: Creates an HTML element for the user to input a 3 character name if their score is on the leaderboard
 * @returns {Promise<String>} 3 character limited String for the username
 */
function nameEntry(){
    return new Promise((resolve) => {
        // Remove existing score input to avoid duplicates
        let scoreInput = document.getElementById("scoreInput");
        if (scoreInput) {
            scoreInput.remove();
        }

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
            if (playerName.trim().length == 3){
                resolve(playerName);
                document.body.removeChild(textNode);  // Clean up form after submission
            } else {
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
export{checkHighScore, nameEntry, addScore, removeScore,getScores, resetScores};