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
            <div id="diedScreen">Game Over!<br>Press Restart Button or 'R' to restart!</div>
            <div id="diedWellScreen">You Died Gloriously!<br>Honor us with your initials!</div>
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