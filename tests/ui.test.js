/**
 * @jest-environment jsdom
 */

beforeEach(() => {
    global.canvas = {
        width: 800,
        height: 400,
        getContext: jest.fn(() => ({
            fillRect: jest.fn(),
            clearRect: jest.fn(),
        })),
    };
    global.document = {
        getElementById: jest.fn(() => canvas),
    };
    global.ctx = canvas.getContext('2d');
    document.body.innerHTML = `
        <div id="screenContainer">
            <div id="pauseScreen" style="display: none;">Game Paused!<br></div>
            <div id="titleOverlay" style="display: none;"></div>
            <div id="gameScreen" style="display: none;"></div>
            <div id="diedScreen" style="display: none;">Game Over!<br>Press Restart Button or 'R' to restart!</div>
            <div id="diedWellScreen" style="display: none;">You Died Gloriously!<br>Honor us with your initials!</div>
        </div>
        <div id="controls">
            <button id="startButton">Start</button>
            <button id="jumpButton">Jump</button>
            <button id="crouchButton">Crouch</button>
            <button id="pauseButton">Pause</button>
            <button id="restartButton">Restart</button>
        </div>
    `;
});

function simulatePause() {
    const pauseScreen = document.getElementById('pauseScreen');
    pauseScreen.style.display = 'flex';
}

function displayTitleOverlay() {
    const titleOverlay = document.getElementById('titleOverlay');
    titleOverlay.style.display = 'block';
}

function displayGameScreen() {
    const gameScreen = document.getElementById('gameScreen');
    gameScreen.style.display = 'flex';
}

function setGameOver(isGameOver) {
    const diedScreen = document.getElementById('diedScreen');
    if (isGameOver) {
        diedScreen.style.display = 'flex';
    } else {
        diedScreen.style.display = 'none';
    }
}

function setNameEnter(isNameEnter) {
    const diedWellScreen = document.getElementById('diedWellScreen');
    if (isNameEnter) {
        diedWellScreen.style.display = 'flex';
    } else {
        diedWellScreen.style.display = 'none';
    }
}

function resetGame() {
    setGameOver(false);
    setNameEnter(false);
}

test('diedScreen should be hidden initially', () => {
    const diedScreen = document.getElementById('diedScreen');
    expect(diedScreen.style.display).toBe('none');
});

test('diedWellScreen should be hidden initially', () => {
    const diedWellScreen = document.getElementById('diedWellScreen');
    expect(diedWellScreen.style.display).toBe('none');
});

test('diedScreen should be displayed when game is over', () => {
    setGameOver(true);
    const diedScreen = document.getElementById('diedScreen');
    expect(diedScreen.style.display).toBe('flex');
});

test('diedWellScreen should be displayed when player achieves a high score', () => {
    setNameEnter(true);
    const diedWellScreen = document.getElementById('diedWellScreen');
    expect(diedWellScreen.style.display).toBe('flex');
});

test('diedScreen should be hidden after game reset', () => {
    setGameOver(true);
    resetGame();
    const diedScreen = document.getElementById('diedScreen');
    expect(diedScreen.style.display).toBe('none');
});

test('diedWellScreen should be hidden after game reset', () => {
    setNameEnter(true);
    resetGame();
    const diedWellScreen = document.getElementById('diedWellScreen');
    expect(diedWellScreen.style.display).toBe('none');
});





test('pauseScreen should be hidden initially', () => {
    const pauseScreen = document.getElementById('pauseScreen');
    expect(pauseScreen.style.display).toBe('none');
});

test('titleOverlay should be hidden initially', () => {
    const titleOverlay = document.getElementById('titleOverlay');
    expect(titleOverlay.style.display).toBe('none');
});

test('gameScreen should be hidden initially', () => {
    const gameScreen = document.getElementById('gameScreen');
    expect(gameScreen.style.display).toBe('none');
});

test('pauseScreen should be displayed when paused', () => {
    const pauseScreen = document.getElementById('pauseScreen');
    simulatePause();
    document.getElementById('pauseButton').click();
    expect(pauseScreen.style.display).toBe('flex');
});

test('titleOverlay should be displayed when title screen is shown', () => {
    displayTitleOverlay();
    const titleOverlay = document.getElementById('titleOverlay');
    expect(titleOverlay.style.display).toBe('block');
});

test('gameScreen should be displayed when game screen is shown', () => {
    displayGameScreen();
    const gameScreen = document.getElementById('gameScreen');
    expect(gameScreen.style.display).toBe('flex');
});