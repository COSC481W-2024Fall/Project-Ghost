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
            // other context methods...
        })),
    };
    global.document = {
        getElementById: jest.fn(() => canvas),
    };
    global.ctx = canvas.getContext('2d');
    document.body.innerHTML = `
        <div id="screenContainer">
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